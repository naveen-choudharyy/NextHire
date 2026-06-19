import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import { QRCodeSVG } from 'qrcode.react';
import { replaceOklchWithRgb } from '../utils/oklch';

// Import Templates
import ATSFriendly from '../templates/ATSFriendly';
import Modern from '../templates/Modern';
import SoftwareDeveloper from '../templates/SoftwareDeveloper';
import Designer from '../templates/Designer';

import {
  ArrowLeft, Cloud, Download, Sparkles, Plus, Trash2, Eye, Award, CheckCircle,
  HelpCircle, RefreshCw, Smartphone, Monitor, Globe, FileCode, CheckSquare, ChevronDown, ChevronUp,
  Check, AlertCircle
} from 'lucide-react';

const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, getAuthHeaders, fetchProfile } = useAuth();
  
  // Mobile responsive states
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [previewScale, setPreviewScale] = useState(0.95);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        const containerWidth = window.innerWidth - 32; // 16px padding on each side
        const newScale = Math.min(1, containerWidth / 800);
        setPreviewScale(newScale);
      } else {
        setPreviewScale(0.95);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [resumeTitle, setResumeTitle] = useState('My Resume');
  const [templateId, setTemplateId] = useState('ats-friendly');
  const [content, setContent] = useState({
    personal: { fullName: '', email: '', phone: '', website: '', github: '', linkedin: '', location: '', summary: '' },
    education: [],
    experience: [],
    projects: [],
    skills: { languages: '', frameworks: '', databases: '', tools: '', soft: '', other: '' },
    certifications: [],
    achievements: [],
    languages: [],
    extracurriculars: []
  });

  // Accordion Section Toggle States
  const [sectionsOpen, setSectionsOpen] = useState({
    personal: true,
    education: true,
    experience: true,
    projects: true,
    skills: true,
    certifications: true
  });

  const toggleSection = (section) => {
    setSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // UI States
  const [saving, setSaving] = useState(false);
  const [atsChecking, setAtsChecking] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  
  // AI Operations Loaders
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [rewritingIndex, setRewritingIndex] = useState(null);
  const [rewritingProjectIndex, setRewritingProjectIndex] = useState(null);
  const [skillSuggestLoading, setSkillSuggestLoading] = useState(false);

  // Portfolio details
  const [isPublic, setIsPublic] = useState(false);
  const [portfolioSlug, setPortfolioSlug] = useState('');
  const [showPortfolioConfig, setShowPortfolioConfig] = useState(false);
  const [hasPortfolioPlan, setHasPortfolioPlan] = useState(false);
  const [isNameLocked, setIsNameLocked] = useState(false);

  // Payment check states
  const [purchasedPlans, setPurchasedPlans] = useState([]);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // UPI QR Code state & timer state
  const [showQRScreen, setShowQRScreen] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [transactionId, setTransactionId] = useState('');
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const isLoadedRef = useRef(false);
  const skipFirstSaveRef = useRef(true);
  const autosaveTimerRef = useRef(null);

  // Reset QR state variables when modal opens/closes
  useEffect(() => {
    if (showPaymentModal) {
      setSelectedPlan(null);
      setShowQRScreen(false);
      setTimeLeft(300);
      setCurrentOrderData(null);
      setPaymentSuccess(false);
      setPaymentLoading(false);
      setTransactionId('');
      setPaymentVerifying(false);
    }
  }, [showPaymentModal]);

  // Countdown timer hook
  useEffect(() => {
    let timer;
    if (showQRScreen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowQRScreen(false);
            setShowPaymentModal(false);
            alert("Payment session expired. Please scan and pay within 5 minutes.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRScreen, timeLeft]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Polling payment status when order is active
  useEffect(() => {
    let interval;
    if (showPaymentModal && currentOrderData && !paymentSuccess) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_BASE}/payment/history`, {
            headers: getAuthHeaders()
          });
          if (response.ok) {
            const history = await response.json();
            const order = history.find(p => p.razorpay_order_id === currentOrderData.order_id);
            if (order && order.status === 'completed') {
              setPaymentSuccess(true);
              setPaymentVerifying(false);
              setShowQRScreen(false);
              checkPortfolioAccess();
              if (fetchProfile) {
                fetchProfile();
              }
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error("Error polling payment status:", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [showPaymentModal, currentOrderData, paymentSuccess]);

  useEffect(() => {
    if (token) {
      fetchResumeDetails();
      checkPortfolioAccess();
    }
  }, [id, token]);


  // Apply body class if payment is required
  useEffect(() => {
    if (token) {
      if (!hasPaid) {
        document.body.classList.add('payment-required');
      } else {
        document.body.classList.remove('payment-required');
      }
    }
    return () => {
      document.body.classList.remove('payment-required');
    };
  }, [hasPaid, token]);

  // Intercept browser print shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        if (!hasPaid) {
          e.preventDefault();
          setShowPaymentModal(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasPaid]);

  const fetchResumeDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume/${id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setResumeTitle(data.title);
        setTemplateId(data.template_id);
        setHasPaid(data.has_paid);
        setHasPortfolioPlan(data.plan_type === 'premium');
        
        // Check if name is already configured/saved in database
        const savedName = data.content?.personal?.fullName || '';
        setIsNameLocked(!!savedName.trim());

        // Migrate old array-based skills structure to new categorized structure
        let parsedContent = data.content || content;
        if (parsedContent.skills && (Array.isArray(parsedContent.skills) || typeof parsedContent.skills === 'string')) {
          parsedContent.skills = {
            languages: Array.isArray(parsedContent.skills) ? parsedContent.skills.join(', ') : parsedContent.skills,
            frameworks: '',
            databases: '',
            tools: '',
            soft: '',
            other: ''
          };
        }
        
        // Pre-populate recommended profile name if name is empty
        if (!parsedContent.personal) {
          parsedContent.personal = {};
        }
        if (!parsedContent.personal.fullName && user?.fullName) {
          parsedContent.personal.fullName = user.fullName;
        }

        setContent(parsedContent);
        setIsPublic(data.is_public);
        setPortfolioSlug(data.portfolio_slug || '');
        isLoadedRef.current = true;
      } else {
        alert('Failed to load resume details.');
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkPortfolioAccess = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume/${id}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setHasPaid(data.has_paid);
        setHasPortfolioPlan(data.plan_type === 'premium');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Change handlers
  const handlePersonalChange = (field, value) => {
    setContent({
      ...content,
      personal: { ...content.personal, [field]: value }
    });
  };

  const handleSkillsChange = (field, value) => {
    setContent({
      ...content,
      skills: { ...content.skills, [field]: value }
    });
  };

  const handleArrayItemChange = (section, index, field, value) => {
    const updated = [...content[section]];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, [section]: updated });
  };

  const addArrayItem = (section, templateObj) => {
    setContent({
      ...content,
      [section]: [...content[section], templateObj]
    });
  };

  const removeArrayItem = (section, index) => {
    const updated = [...content[section]];
    updated.splice(index, 1);
    setContent({ ...content, [section]: updated });
  };

  const addAchievementItem = () => {
    setContent({
      ...content,
      achievements: [...(content.achievements || []), '']
    });
  };

  const removeAchievementItem = (index) => {
    const updated = [...(content.achievements || [])];
    updated.splice(index, 1);
    setContent({ ...content, achievements: updated });
  };

  const handleAchievementChange = (index, value) => {
    const updated = [...(content.achievements || [])];
    updated[index] = value;
    setContent({ ...content, achievements: updated });
  };

  const sectionLabels = {
    education: '2. Education Background',
    experience: '3. Experience Details',
    projects: '4. Featured Projects',
    skills: '5. Technical Toolkit',
    certifications: '6. Certifications',
    achievements: '7. Key Achievements'
  };

  const getSectionOrder = () => {
    return content.sectionOrder || ['education', 'experience', 'projects', 'skills', 'certifications', 'achievements'];
  };

  const handleMoveSection = (direction, index) => {
    const sections = [...getSectionOrder()];
    if (direction === 'up' && index > 0) {
      const temp = sections[index];
      sections[index] = sections[index - 1];
      sections[index - 1] = temp;
    } else if (direction === 'down' && index < sections.length - 1) {
      const temp = sections[index];
      sections[index] = sections[index + 1];
      sections[index + 1] = temp;
    }
    setContent({ ...content, sectionOrder: sections });
  };

  // Save Resume data to Flask Cloud
  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/resume/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: resumeTitle,
          template_id: templateId,
          content: content,
          is_public: isPublic,
          portfolio_slug: portfolioSlug
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned code ${response.status}`);
      }
      setIsNameLocked(true);
      if (!silent) {
        alert('Resume saved successfully!');
      }
    } catch (e) {
      console.error('Save error:', e);
      if (!silent) {
        alert(`Failed to save: ${e.message || e}`);
      }
      throw e; // rethrow so calling function knows it failed
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    setAutosaveStatus('saving');
    try {
      await handleSave(false);
      setAutosaveStatus('saved');
    } catch (e) {
      setAutosaveStatus('error');
    }
  };

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }

    setAutosaveStatus('saving');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await handleSave(true);
        setAutosaveStatus('saved');
      } catch (err) {
        console.error("Autosave failed:", err);
        setAutosaveStatus('error');
      }
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [content, resumeTitle, templateId, isPublic, portfolioSlug]);

  // PDF Download Trigger
  const handleDownloadPDF = async () => {
    if (!hasPaid) {
      setShowPaymentModal(true);
      return;
    }
    // Temporarily patch getComputedStyle to convert oklch colors (which crash html2canvas/html2pdf)
    // and override font-family settings to bypass stylesheet loading/parsing bugs in cloned context
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function(el, pseudoEl) {
      const style = originalGetComputedStyle(el, pseudoEl);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName) {
              const val = target.getPropertyValue(propertyName);
              if (propertyName === 'font-family' || propertyName === 'fontFamily') {
                if (!val || val.includes('var(--font-sans)') || val === 'sans-serif' || val.includes('sans-serif')) {
                  return "'Outfit', 'Inter', sans-serif";
                }
              }
              return replaceOklchWithRgb(val);
            };
          }
          const val = target[prop];
          if (typeof val === 'string') {
            if (prop === 'fontFamily' || prop === 'font-family') {
              if (!val || val.includes('var(--font-sans)') || val === 'sans-serif' || val.includes('sans-serif')) {
                return "'Outfit', 'Inter', sans-serif";
              }
            }
            return replaceOklchWithRgb(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };

    try {
      await handleSave(true); // save first silently
      
      // Wait for fonts to be fully loaded in document
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      const element = document.getElementById('resume-pdf-target');
      if (!element) {
        alert('Error: Resume target element not found for PDF export.');
        return;
      }
      const opt = {
        margin: 0,
        filename: `${resumeTitle.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
        enableLinks: true
      };
      
      const exporter = (typeof html2pdf !== 'undefined' && (html2pdf.default || html2pdf)) || window.html2pdf;
      if (!exporter || typeof exporter !== 'function') {
        throw new Error('html2pdf library is not loaded properly.');
      }
      await exporter().from(element).set(opt).save();
    } catch (e) {
      console.error('PDF download error:', e);
      alert(`Failed to download PDF: ${e.message || e}`);
    } finally {
      // Restore getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;
    }
  };

  // payment process for builder download gate
  const handlePayment = async () => {
    if (!selectedPlan) {
      alert("Please select a plan to purchase.");
      return;
    }
    setPaymentLoading(true);
    try {
      // Create Order on Backend (Dynamic simulation based on backend keys)
      const orderRes = await fetch(`${API_BASE}/payment/order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          plan_type: selectedPlan.type
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        const errorMsg = orderData.message || (typeof orderData.error === 'object' ? orderData.error?.message : orderData.error) || orderData.msg || 'Failed to create payment order';
        throw new Error(errorMsg);
      }

      // Check if order was fully paid using credits
      if (orderData.paid_with_credits) {
        setPaymentSuccess(true);
        await checkPortfolioAccess();
        if (fetchProfile) {
          await fetchProfile();
        }
        setPaymentLoading(false);
        return;
      }

      // If backend is configured with real keys, open official Razorpay Checkout modal
      if (!orderData.is_simulated && window.Razorpay) {
        const options = {
          key: orderData.razorpay_key_id,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'NextHire',
          description: selectedPlan.name,
          order_id: orderData.order_id,
          handler: async function (response) {
            setPaymentLoading(true);
            try {
              const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                setPaymentSuccess(true);
                setShowCheckout(false);
                await checkPortfolioAccess();
                if (fetchProfile) {
                  await fetchProfile();
                }
              } else {
                const verifyErr = verifyData.message || verifyData.error || 'Payment verification failed';
                alert(`Verification failed: ${verifyErr}`);
              }
            } catch (err) {
              alert(`Verification error: ${err.message}`);
            } finally {
              setPaymentLoading(false);
            }
          },
          prefill: {
            name: user?.fullName || 'User',
            email: user?.email || 'user@example.com'
          },
          theme: {
            color: '#4f46e5'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setPaymentLoading(false);
        return;
      }

      // Transition to UPI QR payment display
      setCurrentOrderData(orderData);
      setTimeLeft(300); // Reset countdown to 5 minutes
      setShowQRScreen(true);
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!currentOrderData) return;
    if (!/^\d{12}$/.test(transactionId)) {
      alert("Please enter a valid 12-digit UPI UTR / Reference number.");
      return;
    }
    setPaymentLoading(true);
    try {
      const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          razorpay_order_id: currentOrderData.order_id,
          transaction_id: transactionId
        })
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        if (verifyData.status === 'verifying') {
          setPaymentVerifying(true);
          setShowQRScreen(false);
        } else {
          setPaymentSuccess(true);
          setShowQRScreen(false);
          await checkPortfolioAccess();
          if (fetchProfile) {
            await fetchProfile();
          }
        }
      } else {
        const verifyError = verifyData.message || (typeof verifyData.error === 'object' ? verifyData.error?.message : verifyData.error) || verifyData.msg || 'Payment verification failed';
        alert(`Payment verification failed: ${verifyError}`);
      }
    } catch (err) {
      alert(`Payment verification error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // AI Summary Generator
  const handleGenerateAISummary = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/summary`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profile: {
            fullName: content.personal.fullName,
            title: resumeTitle,
            skills: Object.values(content.skills).filter(Boolean),
            experience: content.experience.map(e => `${e.role} at ${e.company}`)
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        handlePersonalChange('summary', data.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // AI Achievement STAR Rewriter
  const handleRewriteAchievement = async (index, text, isProject = false) => {
    if (isProject) setRewritingProjectIndex(index);
    else setRewritingIndex(index);

    try {
      const res = await fetch(`${API_BASE}/ai/rewrite-achievement`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (isProject) {
          handleArrayItemChange('projects', index, 'description', data.rewritten);
        } else {
          handleArrayItemChange('experience', index, 'description', data.rewritten);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRewritingIndex(null);
      setRewritingProjectIndex(null);
    }
  };

  // AI Skill Recommendations (Categorized)
  const handleSuggestSkills = async () => {
    setSkillSuggestLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/suggest-skills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: resumeTitle })
      });
      if (res.ok) {
        const data = await res.json();
        // Merge values
        const merge = (field, suggestion) => {
          const current = content.skills[field] || '';
          if (!suggestion) return current;
          return current ? `${current}, ${suggestion}` : suggestion;
        };

        setContent({
          ...content,
          skills: {
            languages: merge('languages', data.skills.languages),
            frameworks: merge('frameworks', data.skills.frameworks),
            databases: merge('databases', data.skills.databases),
            tools: merge('tools', data.skills.tools),
            soft: merge('soft', data.skills.soft),
            other: content.skills.other || ''
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSkillSuggestLoading(false);
    }
  };

  // ATS Checker
  const handleCheckATS = async () => {
    setAtsChecking(true);
    setShowAtsModal(true);
    try {
      const res = await fetch(`${API_BASE}/ai/ats-score`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const data = await res.json();
        setAtsResult(data);
        
        // Save ATS Score back to resume record silently
        await fetch(`${API_BASE}/resume/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ats_score: data.score })
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAtsChecking(false);
    }
  };

  // Download Portfolio React source code
  const handleDownloadPortfolioCode = () => {
    const portfolioHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${content.personal.fullName || 'Portfolio'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-gray-100 font-sans min-h-screen">
  <nav class="max-w-6xl mx-auto p-6 flex justify-between items-center border-b border-gray-900">
    <div class="font-bold text-lg text-indigo-400">${content.personal.fullName}</div>
    <div class="space-x-4">
      <a href="#about" class="hover:text-indigo-400">About</a>
      <a href="#projects" class="hover:text-indigo-400">Projects</a>
      <a href="#experience" class="hover:text-indigo-400">Experience</a>
    </div>
  </nav>

  <header class="max-w-4xl mx-auto py-20 px-6 text-center space-y-6">
    <h1 class="text-5xl font-black text-white">${content.personal.fullName}</h1>
    <p class="text-indigo-400 font-mono text-sm tracking-widest uppercase">${content.skills.languages || 'Technical Toolkit'}</p>
    <p class="text-gray-400 max-w-xl mx-auto leading-relaxed">${content.personal.summary}</p>
    <div class="flex justify-center space-x-3 text-xs">
      <span>📧 ${content.personal.email}</span>
      <span>📞 ${content.personal.phone}</span>
    </div>
  </header>

  <section id="projects" class="max-w-4xl mx-auto py-12 px-6 border-t border-gray-900 space-y-6">
    <h2 class="text-2xl font-bold text-white">Featured Projects</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${content.projects.map(p => `
        <div class="bg-gray-900 p-5 rounded-lg border border-gray-800">
          <h3 class="font-bold text-white text-lg">${p.name}</h3>
          <span class="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded">${p.tech}</span>
          <p class="text-gray-450 text-xs mt-3">${p.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <section id="experience" class="max-w-4xl mx-auto py-12 px-6 border-t border-gray-900 space-y-6">
    <h2 class="text-2xl font-bold text-white">Experience</h2>
    <div class="space-y-6">
      ${content.experience.map(e => `
        <div>
          <div class="flex justify-between font-semibold">
            <span>${e.role} — <span class="text-indigo-400">${e.company}</span></span>
            <span class="text-gray-500 text-xs font-mono">${e.startYear} - ${e.endYear || 'Present'}</span>
          </div>
          <p class="text-gray-400 text-xs mt-1 leading-relaxed">${e.description}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <footer class="text-center py-10 text-xs text-gray-700">Powered by NextHire</footer>
</body>
</html>`;

    const blob = new Blob([portfolioHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'portfolio_source.html';
    link.click();
  };

  // Map templates
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern':
        return <Modern content={content} />;
      case 'software-developer':
        return <SoftwareDeveloper content={content} />;
      case 'designer':
        return <Designer content={content} />;
      case 'ats-friendly':
      default:
        return <ATSFriendly content={content} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Top action bar */}
      <div className="bg-dark-950 border-b border-dark-800 lg:h-14 py-2.5 lg:py-0 px-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center space-x-3 justify-between lg:justify-start w-full lg:w-auto">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-white" title="Dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="bg-transparent text-sm font-bold border-0 focus:ring-1 focus:ring-brand-500 rounded px-1.5 py-0.5 text-white max-w-[200px]"
            />
            {autosaveStatus === 'saving' && (
              <span className="text-[10px] text-gray-400 flex items-center space-x-1 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin text-brand-500" />
                <span>Autosaving...</span>
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-[10px] text-green-400 flex items-center space-x-1">
                <Check className="h-3 w-3 text-green-400" />
                <span>All changes saved</span>
              </span>
            )}
            {autosaveStatus === 'error' && (
              <span className="text-[10px] text-rose-400 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3 text-rose-400" />
                <span>Save failed (retrying)</span>
              </span>
            )}
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2.5 text-xs overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none flex-shrink-0">
          
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 text-white flex-shrink-0"
          >
            <option value="ats-friendly">ATS-Friendly Layout</option>
            <option value="modern">Modern Sidebar</option>
            <option value="software-developer">Developer layout</option>
            <option value="designer">Designer layout</option>
          </select>

          <button
            onClick={handleCheckATS}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-accent-500/20 text-accent-400 hover:bg-accent-500/10 font-medium transition flex-shrink-0"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Check ATS</span>
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving || autosaveStatus === 'saving'}
            className="flex items-center space-x-1 bg-dark-900 border border-dark-700 hover:bg-dark-800 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50 flex-shrink-0"
          >
            {(saving || autosaveStatus === 'saving') ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
            <span>{(saving || autosaveStatus === 'saving') ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition font-semibold flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>

        </div>
      </div>

      {/* Mobile Toggle Tabs */}
      <div className="flex lg:hidden bg-dark-950 border-b border-dark-800 text-xs font-bold text-gray-400 flex-shrink-0">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3 text-center border-b-2 transition-all ${
            activeTab === 'editor' ? 'border-brand-500 text-white bg-dark-900/40' : 'border-transparent hover:text-white'
          }`}
        >
          Edit Details
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 text-center border-b-2 transition-all ${
            activeTab === 'preview' ? 'border-brand-500 text-white bg-dark-900/40' : 'border-transparent hover:text-white'
          }`}
        >
          View Preview
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column Accordion Scroll Form (All Stacked & Visible) */}
        <div className={`w-full lg:w-[500px] bg-dark-950 border-r border-dark-800 overflow-y-auto p-4 lg:p-5 space-y-5 lg:flex-shrink-0 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
          
          {/* SECTION ARRANGEMENT */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800 text-sm font-extrabold text-white">
              <span>Resume Section Arrangement</span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] text-gray-400 mb-1">Use the up/down arrows to reorder major sections on your final resume.</p>
              {getSectionOrder().map((sec, idx) => (
                <div key={sec} className="flex justify-between items-center p-2 bg-dark-905 rounded-lg border border-dark-800">
                  <span className="text-xs font-semibold text-white">{sectionLabels[sec] || sec}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection('up', idx)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-dark-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === getSectionOrder().length - 1}
                      onClick={() => handleMoveSection('down', idx)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-dark-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1. PERSONAL DETAILS SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800 text-sm font-extrabold text-white">
              <span>1. Personal Information</span>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1 flex items-center justify-between">
                    <span>Full Name</span>
                    {isNameLocked && (
                      <span className="text-[9px] text-brand-400 font-normal">Locked after save</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={content.personal.fullName || ''}
                    onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                    disabled={isNameLocked}
                    className={`w-full text-xs p-2 border border-dark-800 rounded-lg focus:outline-none ${
                      isNameLocked
                        ? 'bg-dark-900/40 text-gray-400 cursor-not-allowed'
                        : 'bg-dark-900 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={content.personal.title || ''}
                    onChange={(e) => handlePersonalChange('title', e.target.value)}
                    placeholder="e.g. Data Science — Full-Stack Developer"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={content.personal.email || ''}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={content.personal.phone || ''}
                    onChange={(e) => handlePersonalChange('phone', e.target.value.replace(/[^0-9+\s()-]/g, ''))}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={content.personal.location || ''}
                    onChange={(e) => handlePersonalChange('location', e.target.value)}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                    placeholder="e.g. New York, USA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">Website URL</label>
                  <input
                    type="text"
                    value={content.personal.website || ''}
                    onChange={(e) => handlePersonalChange('website', e.target.value)}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={content.personal.linkedin || ''}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={content.personal.github || ''}
                    onChange={(e) => handlePersonalChange('github', e.target.value)}
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] text-gray-500 font-semibold">Profile Summary</label>
                  <button
                    type="button"
                    onClick={handleGenerateAISummary}
                    disabled={aiSummaryLoading}
                    className="text-[10px] text-brand-400 font-bold hover:underline flex items-center space-x-0.5"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{aiSummaryLoading ? 'Composing...' : 'Write with AI'}</span>
                  </button>
                </div>
                <textarea
                  rows="3"
                  value={content.personal.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  className="w-full text-xs p-2.5 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 2. EDUCATION SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">2. Education Background ({content.education.length})</span>
              <button
                onClick={() => addArrayItem('education', { school: '', degree: '', location: '', startYear: '', endYear: '', gpa: '', type: 'college', customType: '' })}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {content.education.map((edu, idx) => {
                const type = edu.type || 'college';
                const schoolLabel = type === 'school' ? 'School Name' : (type === 'college' ? 'College / University Name' : 'Institution Name');
                const degreeLabel = type === 'school' ? 'Class / Examination (e.g. Class XII CBSE)' : (type === 'college' ? 'Degree / Major (e.g. B.Tech Computer Science)' : 'Course / Qualification Name');
                const gpaLabel = type === 'school' ? 'Percentage / GPA (e.g. 95.8% or 9.5 CGPA)' : (type === 'college' ? 'CGPA / GPA (e.g. 8.78)' : 'Grade / Score / CGPA');

                return (
                  <div key={idx} className="p-3 bg-dark-900 rounded-lg border border-dark-800 space-y-3 relative">
                    <button
                      onClick={() => removeArrayItem('education', idx)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">Education Level / Type</label>
                        <select
                          value={edu.type || 'college'}
                          onChange={(e) => handleArrayItemChange('education', idx, 'type', e.target.value)}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        >
                          <option value="college">College / University</option>
                          <option value="school">School (Class X / XII)</option>
                          <option value="other">Other (Custom Type)</option>
                        </select>
                      </div>

                      {edu.type === 'other' && (
                        <div className="col-span-2">
                          <label className="block text-[9px] text-gray-500 font-semibold mb-1">Specify Institution Type Name</label>
                          <input
                            type="text"
                            value={edu.customType || ''}
                            onChange={(e) => handleArrayItemChange('education', idx, 'customType', e.target.value)}
                            placeholder="e.g. Diploma, Bootcamp, Academy"
                            className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">{schoolLabel}</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleArrayItemChange('education', idx, 'school', e.target.value)}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">Location (State/Country)</label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) => handleArrayItemChange('education', idx, 'location', e.target.value)}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. California, USA"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">{degreeLabel}</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleArrayItemChange('education', idx, 'degree', e.target.value)}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => handleArrayItemChange('education', idx, 'startYear', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. 2023"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">End Year (or Expected)</label>
                        <input
                          type="text"
                          value={edu.endYear}
                          onChange={(e) => handleArrayItemChange('education', idx, 'endYear', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. 2027"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] text-gray-500 font-semibold mb-1">{gpaLabel}</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => handleArrayItemChange('education', idx, 'gpa', e.target.value)}
                          className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. 9.0/10 or 85%"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. WORK EXPERIENCE SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">3. Work Experience ({content.experience.length})</span>
              <button
                onClick={() => addArrayItem('experience', { role: '', company: '', location: '', startYear: '', endYear: '', description: '' })}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {content.experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-dark-900 rounded-lg border border-dark-800 space-y-3 relative">
                  <button
                    onClick={() => removeArrayItem('experience', idx)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Job Role Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleArrayItemChange('experience', idx, 'role', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayItemChange('experience', idx, 'company', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        placeholder="e.g. Acme Corporation"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleArrayItemChange('experience', idx, 'location', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        placeholder="e.g. Chicago, IL"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Duration (Start - End)</label>
                      <div className="flex space-x-1">
                        <input
                          type="text"
                          value={exp.startYear}
                          onChange={(e) => handleArrayItemChange('experience', idx, 'startYear', e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                          className="w-1/2 text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. Jun 2024"
                        />
                        <input
                          type="text"
                          value={exp.endYear}
                          onChange={(e) => handleArrayItemChange('experience', idx, 'endYear', e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                          className="w-1/2 text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                          placeholder="e.g. Present"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] text-gray-500 font-semibold">Describe Achievements (Newline for each Bullet Point)</label>
                      <button
                        type="button"
                        onClick={() => handleRewriteAchievement(idx, exp.description, false)}
                        disabled={rewritingIndex === idx}
                        className="text-[9px] text-brand-400 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{rewritingIndex === idx ? 'Optimizing...' : 'AI Rewrite'}</span>
                      </button>
                    </div>
                    <textarea
                      rows="4"
                      value={exp.description}
                      onChange={(e) => handleArrayItemChange('experience', idx, 'description', e.target.value)}
                      className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none leading-relaxed"
                      placeholder="• Engineered responsive web interfaces using React..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. KEY PROJECTS SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">4. Featured Projects ({content.projects.length})</span>
              <button
                onClick={() => addArrayItem('projects', { name: '', tech: '', link: '', description: '' })}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {content.projects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-dark-900 rounded-lg border border-dark-800 space-y-3 relative">
                  <button
                    onClick={() => removeArrayItem('projects', idx)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Project Name (e.g. HealthNudge - AI Report Analyzer)</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleArrayItemChange('projects', idx, 'name', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Tech Stack (e.g. React, MongoDB)</label>
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => handleArrayItemChange('projects', idx, 'tech', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Project URL / Links</label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) => handleArrayItemChange('projects', idx, 'link', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                        placeholder="e.g. github.com/username/project"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] text-gray-500 font-semibold">Describe Project (Newline for each Bullet Point)</label>
                      <button
                        type="button"
                        onClick={() => handleRewriteAchievement(idx, proj.description, true)}
                        disabled={rewritingProjectIndex === idx}
                        className="text-[9px] text-brand-400 font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{rewritingProjectIndex === idx ? 'Optimizing...' : 'AI Rewrite'}</span>
                      </button>
                    </div>
                    <textarea
                      rows="4"
                      value={proj.description}
                      onChange={(e) => handleArrayItemChange('projects', idx, 'description', e.target.value)}
                      className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none leading-relaxed"
                      placeholder="• Built OCR pipeline with Python and Tesseract..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. CATEGORIZED SKILLS SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">5. Technical & Soft Skills</span>
              <button
                onClick={handleSuggestSkills}
                disabled={skillSuggestLoading}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Sparkles className="h-3 w-3" />
                <span>{skillSuggestLoading ? 'Loading...' : 'AI Recommend'}</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Languages</label>
                  <input
                    type="text"
                    value={content.skills?.languages || ''}
                    onChange={(e) => handleSkillsChange('languages', e.target.value)}
                    placeholder="e.g. C++, JavaScript, Python, HTML/CSS"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={content.skills?.frameworks || ''}
                    onChange={(e) => handleSkillsChange('frameworks', e.target.value)}
                    placeholder="e.g. React.js, Node.js, Express.js, Tailwind CSS"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Databases</label>
                  <input
                    type="text"
                    value={content.skills?.databases || ''}
                    onChange={(e) => handleSkillsChange('databases', e.target.value)}
                    placeholder="e.g. MongoDB, MySQL, PostgreSQL"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Tools & Technologies</label>
                  <input
                    type="text"
                    value={content.skills?.tools || ''}
                    onChange={(e) => handleSkillsChange('tools', e.target.value)}
                    placeholder="e.g. Git, GitHub, Vercel, AWS, Postman"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Soft Skills</label>
                  <input
                    type="text"
                    value={content.skills?.soft || ''}
                    onChange={(e) => handleSkillsChange('soft', e.target.value)}
                    placeholder="e.g. Team Collaboration, Leadership, Communication"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">Other Skills / Methodologies</label>
                  <input
                    type="text"
                    value={content.skills?.other || ''}
                    onChange={(e) => handleSkillsChange('other', e.target.value)}
                    placeholder="e.g. Agile Development, Scrum, Debugging"
                    className="w-full text-xs p-2 bg-dark-900 border border-dark-800 rounded-lg text-white focus:outline-none placeholder-gray-650"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6. CERTIFICATIONS SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">6. Certifications ({content.certifications.length})</span>
              <button
                onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {content.certifications.map((cert, idx) => (
                <div key={idx} className="p-3 bg-dark-900 rounded-lg border border-dark-800 space-y-3 relative">
                  <button
                    onClick={() => removeArrayItem('certifications', idx)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleArrayItemChange('certifications', idx, 'name', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Issuer Agency</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleArrayItemChange('certifications', idx, 'issuer', e.target.value)}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-semibold mb-1">Year</label>
                      <input
                        type="text"
                        value={cert.year}
                        onChange={(e) => handleArrayItemChange('certifications', idx, 'year', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        className="w-full text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. ACHIEVEMENTS SECTION */}
          <div className="glass rounded-xl border border-dark-800 overflow-hidden bg-dark-900/20 shadow-md">
            <div className="w-full flex justify-between items-center bg-dark-900/60 p-4 border-b border-dark-800">
              <span className="text-sm font-extrabold text-white">7. Achievements ({content.achievements ? content.achievements.length : 0})</span>
              <button
                onClick={addAchievementItem}
                className="text-[10px] bg-brand-500/10 border border-brand-500/25 text-brand-400 font-bold rounded px-2.5 py-1 flex items-center space-x-1 hover:bg-brand-500/20 transition"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {(content.achievements || []).map((ach, idx) => (
                <div key={idx} className="flex items-center space-x-2 relative">
                  <input
                    type="text"
                    value={ach}
                    onChange={(e) => handleAchievementChange(idx, e.target.value)}
                    placeholder="e.g. Secured 1st rank in college coding hackathon..."
                    className="flex-1 text-xs p-1.5 bg-dark-950 border border-dark-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => removeAchievementItem(idx)}
                    className="text-gray-500 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Preview Panel */}
        <div className={`flex-1 bg-dark-900 overflow-y-auto overflow-x-hidden p-4 lg:p-8 flex justify-center ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', width: '800px', flexShrink: 0 }} className="print:transform-none print:scale-100">
            <div className={`w-[800px] h-max bg-white shadow-lg font-template-${templateId}`} id="resume-pdf-target">
              {renderTemplate()}
            </div>
          </div>
        </div>

      </div>

      {/* ATS score overlay modal */}
      {showAtsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-700 p-6 space-y-5 shadow-2xl animate-zoomIn">
            <div className="flex justify-between items-center border-b border-dark-700 pb-3">
              <h3 className="text-lg font-bold text-white">ATS Compatibility Audit</h3>
              <button onClick={() => setShowAtsModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {atsChecking ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                <span className="text-xs text-gray-400">Parsing bullet structures and scoring keyword density...</span>
              </div>
            ) : atsResult ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="relative h-24 w-24 flex items-center justify-center rounded-full bg-dark-950 border-4 border-brand-500">
                    <span className="text-2xl font-black text-white">{atsResult.score}/100</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">Resume Strength Grade</h4>
                    <p className="text-xs text-gray-400">Target scores higher than 80% to pass screens.</p>
                  </div>
                </div>

                {atsResult.missing_keywords?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-red-400 block">Identified Missing Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.missing_keywords.map((kw, i) => (
                        <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t border-dark-750 pt-3">
                  <span className="text-xs font-semibold text-brand-400 block">Critical Checklist & Tips:</span>
                  <ul className="text-[11px] text-gray-300 space-y-2.5 leading-relaxed">
                    {atsResult.suggestions?.map((sug, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-brand-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Download and Print Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-zoomIn max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-dark-950 p-4 border-b border-dark-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="bg-brand-500 p-1.5 rounded text-white text-xs font-bold">NH</span>
                <span className="font-bold text-white text-base">Unlock Resume Download & Print</span>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentSuccess(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {paymentSuccess ? (
                <div className="py-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Payment Verified!</h3>
                  <p className="text-sm text-gray-400 font-medium">
                    You have successfully unlocked downloads and printing. Your resume is now ready to download.
                  </p>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentSuccess(false);
                        setSelectedPlan(null);
                        // Trigger download after closing success
                        setTimeout(() => {
                          handleDownloadPDF();
                        }, 300);
                      }}
                      className="bg-brand-500 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-brand-600 transition shadow-lg shadow-brand-500/25"
                    >
                      Download PDF Now
                    </button>
                  </div>
                </div>
              ) : paymentVerifying ? (
                <div className="py-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2 animate-pulse">
                    <span className="text-xl">⏳</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Verification Pending</h3>
                  <p className="text-sm text-gray-400">
                    Your payment reference (UTR: <strong>{transactionId}</strong>) has been submitted. The admin will verify the transfer shortly to unlock download access.
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentVerifying(false);
                      setSelectedPlan(null);
                    }}
                    className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-600 transition"
                  >
                    Close
                  </button>
                </div>
              ) : selectedPlan ? (() => {
                const planPrice = parseInt(selectedPlan.price.replace('₹', ''), 10);
                const finalAmount = planPrice;

                return showQRScreen ? (
                  <div className="max-w-md mx-auto space-y-6 py-4 text-center">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Scan & Pay via UPI</h3>
                      <p className="text-xs text-gray-400">Scan using any UPI app (GPay, PhonePe, Paytm)</p>
                    </div>

                    {/* Dynamic QR Code Card with Locked Amount */}
                    <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
                      <QRCodeSVG 
                        value={`upi://pay?pa=9257540743@ptsbi&pn=Naveen&am=${finalAmount}&mam=${finalAmount}&cu=INR&tr=${currentOrderData?.order_id || 'order'}`}
                        size={192}
                        className="mx-auto"
                      />
                    </div>

                    {/* Pricing and Timer Details */}
                    <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 space-y-2 text-left">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Plan:</span>
                        <span className="font-bold text-white">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Payable Amount:</span>
                        <span className="text-brand-400 font-extrabold text-lg">₹{finalAmount}</span>
                      </div>
                      <div className="border-t border-dark-800 pt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-400">Session Expires In:</span>
                        <span className="text-rose-400 font-mono font-bold flex items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-2"></span>
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>

                    {/* Transaction ID Input */}
                    <div className="space-y-1.5 text-left max-w-sm mx-auto">
                      <label className="block text-xs font-semibold text-gray-400">
                        Enter UPI Ref No. / UTR (12 digits) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="e.g. 123456789012"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs p-2.5 bg-dark-950 border border-dark-800 rounded-lg text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    {/* Instructions */}
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Please complete the payment inside your UPI app. Once done, enter the reference number above and click the <strong>Verify Payment</strong> button below.
                    </p>

                    {/* Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={handleVerifyQR}
                        disabled={paymentLoading || transactionId.length !== 12}
                        className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Verifying transaction...</span>
                          </>
                        ) : (
                          <span>Verify Payment</span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowQRScreen(false)}
                        className="w-full bg-dark-900 border border-dark-700 text-gray-400 py-2.5 rounded-lg font-semibold hover:text-white transition"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Checkout details */
                  <div className="max-w-md mx-auto space-y-6 py-4">
                    <button
                      onClick={() => setSelectedPlan(null)}
                      className="text-xs text-brand-400 hover:underline flex items-center space-x-1"
                    >
                      ← Back to Plan Options
                    </button>

                    <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white">{selectedPlan.name}</h4>
                        <p className="text-xs text-gray-505">Includes lifetime templates & tools</p>
                      </div>
                      <span className="text-xl font-bold text-brand-400">{selectedPlan.price}</span>
                    </div>

                    {/* Plan Price Summary */}
                    <div className="bg-dark-950 rounded-lg p-4 border border-dark-800 flex justify-between items-center text-sm font-bold text-white">
                      <span>Net Payable Amount:</span>
                      <span className="text-brand-400 text-lg">₹{finalAmount}</span>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={paymentLoading}
                      className="w-full bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Generating QR Code...</span>
                        </>
                      ) : (
                        <span>Pay ₹{finalAmount}</span>
                      )}
                    </button>
                  </div>
                );
              })() : (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto">
                    <h3 className="text-xl font-bold text-white">Unlock Resume Pass</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Upgrade to unlock all resume templates, AI bullet rewrites, cover letter generators, and high-quality PDF downloads.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto pt-2">
                    {[
                      {
                        name: "Resume Builder Pass",
                        price: "₹30",
                        description: "Full access to resume templates, AI bullet point rewrites, summary composers, and cover letter generators.",
                        type: "basic",
                        features: [
                          "Access to All 4 Layout Templates",
                          "Unlimited AI Bullet Point Rewrites",
                          "AI Resume Summary Composer",
                          "ATS Core Score Checker & Matcher",
                          "Integrated AI Cover Letter Generator",
                          "High Quality PDF Download"
                        ],
                        popular: true
                      }
                    ].map((plan) => (
                      <div
                        key={plan.type}
                        className={`flex flex-col justify-between rounded-xl bg-dark-900/60 p-5 border text-left transition-all ${
                          plan.popular ? 'border-brand-500 ring-1 ring-brand-500 bg-brand-500/5' : 'border-dark-700'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-white">{plan.name}</span>
                            {plan.popular && (
                              <span className="bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline mb-2">
                            <span className="text-2xl font-black text-white">{plan.price}</span>
                            <span className="text-[10px] text-gray-500 ml-1">one-time</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mb-4 h-8">{plan.description}</p>
                          <ul className="space-y-1.5 border-t border-dark-800 pt-3 text-[10px] text-gray-300">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="h-3 w-3 text-brand-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className={`mt-5 w-full rounded-lg py-2 text-xs font-semibold text-center transition ${
                            plan.popular
                              ? 'bg-brand-500 text-white hover:bg-brand-600'
                              : 'bg-dark-950 text-white hover:bg-dark-900 border border-dark-700'
                          }`}
                        >
                          Select Upgrade
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
      {/* Floating Download PDF Button for Mobile */}
      <button
        onClick={handleDownloadPDF}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-500 hover:bg-brand-600 text-white px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 duration-200 border border-brand-400/20 font-bold text-xs"
      >
        <Download className="h-4 w-4" />
        <span>Download PDF</span>
      </button>

    </div>
  );
};

export default Builder;
