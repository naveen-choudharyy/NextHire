# Dataset for training local resume classifier
# Formatted as tuples of (text, label)

DATASET = [
    # Data Science & Machine Learning (10 samples)
    (
        "Highly analytical Data Scientist with 3+ years experience. Expert in Python, SQL, pandas, numpy, scikit-learn, and TensorFlow. Developed predictive machine learning models to forecast customer churn and trained neural networks for image classification. Passionate about machine learning, deep learning, statistical analysis, NLP, data visualization in Tableau, and building regression models.",
        "Data Science & Machine Learning"
    ),
    (
        "Machine Learning Engineer specializing in NLP and deep learning. Experienced with PyTorch, Keras, HuggingFace transformers, BERT, and data engineering. Built semantic search engines and trained custom LLMs. Strong skills in data analysis, predictive modeling, statistics, data visualization, and ML pipelines.",
        "Data Science & Machine Learning"
    ),
    (
        "Data Analyst transitioning to Machine Learning. Strong background in Python, R, SQL, Pandas, Matplotlib, Scipy, and powerbi. Built data visualization dashboards, cleaned unstructured datasets, performed statistical hypothesis testing, and developed basic classification and clustering models.",
        "Data Science & Machine Learning"
    ),
    (
        "AI Research Scientist with a focus on computer vision and neural network optimization. Proficient in OpenCV, PyTorch, PySpark, scikit-learn, Jupyter notebooks. Published research on object detection using CNNs. Experienced in regression, random forests, hyperparameter tuning, and data preprocessing.",
        "Data Science & Machine Learning"
    ),
    (
        "Senior Data Scientist and ML Ops Engineer. Architected automated ML pipelines on AWS SageMaker. Proficient in Python, SQL, scikit-learn, MLflow, Docker, Kubernetes. Built real-time recommendation systems and anomaly detection models using isolation forests. Passionate about feature engineering and big data analytics.",
        "Data Science & Machine Learning"
    ),
    (
        "Graduate student in Data Science. Skilled in exploratory data analysis (EDA), python programming, SQL database queries, pandas, numpy, seaborn, and scikit-learn algorithms. Completed projects in sentiment analysis and regression models.",
        "Data Science & Machine Learning"
    ),
    (
        "Quantitative Analyst with experience in statistical modeling and machine learning. Expert in R, Python, pandas, statsmodels, time-series forecasting (ARIMA), and predictive data mining. Trained linear regression, decision tree, and gradient boosting classifiers.",
        "Data Science & Machine Learning"
    ),
    (
        "ML Specialist with deep expertise in PyTorch, computer vision, CNNs, YOLO, and PyImageSearch. Designed data pipelines for preprocessing high-resolution video streams. Trained classification and segmentation models with high validation accuracy.",
        "Data Science & Machine Learning"
    ),
    (
        "NLP Engineer. Developed conversational chatbots, named entity recognition (NER) models, and text summarization APIs. Technologies: Python, NLTK, SpaCy, scikit-learn, HuggingFace transformers, PyTorch, SQL.",
        "Data Science & Machine Learning"
    ),
    (
        "Data Engineer / Scientist. Optimized SQL ETL pipelines and built predictive analytics dashboards. Expert in PySpark, Python, pandas, scikit-learn, PostgreSQL, and Elasticsearch. Implemented K-Means clustering to segment user behavior.",
        "Data Science & Machine Learning"
    ),

    # Frontend Web Development (10 samples)
    (
        "Creative Frontend Developer with 4 years of experience. Expert in React.js, JavaScript, TypeScript, HTML5, CSS3, Tailwind CSS, and Redux Toolkit. Built highly responsive user interfaces, optimized web performance, integrated REST APIs, and implemented smooth Framer Motion animations. Focused on UI/UX, responsive design, component libraries, and visual design.",
        "Frontend Web Development"
    ),
    (
        "UI Developer with a passion for building elegant single-page applications (SPAs). Specialized in Vue.js, Vuex, Nuxt.js, HTML, CSS, Sass, Tailwind CSS, and Webpack. Designed component libraries and collaborated with designers using Figma to prototype workflows. Expert in cross-browser compatibility.",
        "Frontend Web Development"
    ),
    (
        "Next.js and React Developer focused on server-side rendering (SSR) and search engine optimization (SEO). Experienced with TypeScript, JavaScript, CSS modules, Tailwind, and GraphQL. Integrated headless CMS systems, optimized Lighthouse performance scores, and built clean, interactive dashboards.",
        "Frontend Web Development"
    ),
    (
        "Junior Web Developer. Proficient in HTML5, CSS3, JavaScript (ES6+), React.js, and Bootstrap. Built responsive personal portfolios, landing pages, and interactive web tools. Highly skilled in converting Figma designs to pixel-perfect HTML/CSS.",
        "Frontend Web Development"
    ),
    (
        "Lead Frontend Architect. Expert in modern JavaScript frameworks (React, Angular), state management (Redux, MobX), and frontend builds (Vite, Webpack). Established design systems, UI components, and integrated secure auth tokens in React applications. Passionate about web accessibility (WCAG).",
        "Frontend Web Development"
    ),
    (
        "Web Developer focusing on interactive user experiences. Expert in JavaScript, CSS animations, Three.js, Canvas, React, Framer Motion, and Tailwind CSS. Built stunning product marketing pages and portfolios with smooth transitions and animations.",
        "Frontend Web Development"
    ),
    (
        "Mobile & Frontend Engineer. Specialized in React Native for iOS/Android and React.js for web. Skilled in TypeScript, CSS, flexbox, Redux, Tailwind, and native device API integrations. Focused on responsive layouts and UI performance.",
        "Frontend Web Development"
    ),
    (
        "Frontend Engineer with experience in e-commerce platforms. Built user-friendly product detail pages, checkout flows, and catalog filters using React, Redux, Tailwind, and HTML/CSS. Integrated payment gateways (Stripe, PayPal) and optimized client-side load times.",
        "Frontend Web Development"
    ),
    (
        "Angular Developer. Experienced in TypeScript, RxJS, Angular Material, NgRx, HTML5, and Sass. Built enterprise dashboard portals, managed route guards, and consumed RESTful APIs.",
        "Frontend Web Development"
    ),
    (
        "Svelte / React Developer. Passionate about lightweight frontend architectures. Skilled in HTML, CSS, JavaScript, SvelteKit, React, Tailwind, and CSS-in-JS. Optimized website assets and images, reducing page weight by 40%.",
        "Frontend Web Development"
    ),

    # Backend & Cloud Engineering (10 samples)
    (
        "Robust Backend Engineer with 5+ years of experience. Expert in Node.js, Express, Python, Django, Flask, Java, Spring Boot, and REST API development. Architected secure user authentication systems using JWT, implemented database schemas using Mongoose (MongoDB) and PostgreSQL. Specialized in Docker, AWS, microservices, cloud deployments, and CI/CD pipelines.",
        "Backend & Cloud Engineering"
    ),
    (
        "Cloud Architect and DevOps Engineer. Expert in AWS (EC2, S3, RDS, Lambda), Terraform, Docker, Kubernetes, Jenkins CI/CD, and Linux bash scripting. Implemented highly available, auto-scaling infrastructure, set up Nginx reverse proxies, SSL certificates, and secure cloud networking architectures.",
        "Backend & Cloud Engineering"
    ),
    (
        "Go / Python Developer specializing in backend microservices and high-throughput systems. Experienced in Go (Golang), gRPC, Python, Flask, FastAPI, Redis, RabbitMQ, and Apache Kafka. Designed high-performance message queues, database indexing strategies, and automated unit testing frameworks.",
        "Backend & Cloud Engineering"
    ),
    (
        "Database Administrator & Backend Developer. Strong database design skills in MySQL, PostgreSQL, MongoDB, and Redis. Experienced in SQL optimization, indexing, query execution planning, Node.js backend development, Express routes, and secure RESTful API architectures.",
        "Backend & Cloud Engineering"
    ),
    (
        "Java Spring Boot Developer with a focus on secure enterprise backends. Proficient in Java, Hibernate, Spring Cloud, PostgreSQL, JUnit, and OAuth2 security. Integrated microservices, developed secure REST APIs, and managed build tools (Maven, Gradle).",
        "Backend & Cloud Engineering"
    ),
    (
        "Node.js Backend Developer. Specialized in Express, NestJS, Mongoose, TypeORM, and TypeScript. Implemented secure token refresh strategies, HttpOnly cookies, rate limiting, and input validation schemas using Zod. Passionate about clean backend architectures.",
        "Backend & Cloud Engineering"
    ),
    (
        "Python Backend Engineer. Expert in Flask, Django, PostgreSQL, SQLAlchemy, and API design. Developed complex data parsing scripts, scheduled background cron tasks (Celery/Redis), and integrated third-party APIs.",
        "Backend & Cloud Engineering"
    ),
    (
        "C# / .NET Developer. Skilled in ASP.NET Core, Entity Framework, SQL Server, and azure cloud services. Built enterprise APIs, integrated Azure Active Directory, and deployed serverless functions.",
        "Backend & Cloud Engineering"
    ),
    (
        "PHP / Laravel Developer. Built full-stack and API-only backends using Laravel, MySQL, Redis, and PHP. Managed migrations, seeders, middleware, and queues. Experienced in deploying to Linux servers.",
        "Backend & Cloud Engineering"
    ),
    (
        "DevOps Engineer. Configured Gitlab CI, Github Actions, Docker Compose setups, Prometheus/Grafana monitoring, and automated cloud backup scripts. Strong focus on security hardening and server administration.",
        "Backend & Cloud Engineering"
    ),

    # Product Management & Operations (10 samples)
    (
        "Result-oriented Product Manager with 5 years experience. Skilled in product lifecycle management, agile methodologies, scrum, and user story creation. Led cross-functional teams of engineers and designers to launch B2B SaaS features. Proficient in JIRA, Confluence, Productboard, Mixpanel, and user feedback analysis. Dedicated to market research and product roadmap planning.",
        "Product Management & Operations"
    ),
    (
        "Scrum Master and Agile Coach. Certified SAFe practitioner. Facilitated sprint planning, daily standups, sprint reviews, and retrospectives. Coordinated between engineering leads, product managers, and business stakeholders to resolve dependency blocks and streamline development pipelines.",
        "Product Management & Operations"
    ),
    (
        "Operations Manager with experience scaling startup workflows. Specialized in process optimization, business operations, project management, resource scheduling, and cross-functional team coordination. Proficient in Notion, Slack, Airtable, and Monday.com.",
        "Product Management & Operations"
    ),
    (
        "Product Owner for e-commerce systems. Defined product backlogs, prioritized feature stories, and managed product roadmaps. Conducted user acceptance testing (UAT), user interviews, and A/B testing campaigns to improve conversion metrics.",
        "Product Management & Operations"
    ),
    (
        "Project Manager / Coordinator. Experienced in tracking project deliverables, timelines, and budgets. Expert in Agile/Waterfall methodologies, Gantt charts, MS Project, and stakeholder reporting. Managed risk assessments and scope changes.",
        "Product Management & Operations"
    ),
    (
        "Technical Product Manager. Ex-developer with background in computer science. Defined API specifications, developer integrations, and technical product requirements. Managed product release notes, SDK updates, and developer documentation.",
        "Product Management & Operations"
    ),
    (
        "Operations Specialist. Optimized customer onboarding workflows, reducing churn by 15%. Coordinated customer support, IT operations, vendor management, and business metrics tracking using Salesforce and Zendesk.",
        "Product Management & Operations"
    ),
    (
        "Growth Product Manager. Focused on user acquisition and activation. Analyzed funnel metrics using Google Analytics, Amplitude, and SQL. Conducted A/B testing of pricing models, onboarding flows, and referral loops.",
        "Product Management & Operations"
    ),
    (
        "Program Manager. Overseen multiple concurrent software projects, aligned engineering capacities with corporate goals, and managed resource planning. Expert in Jira, portfolio management, and executive communications.",
        "Product Management & Operations"
    ),
    (
        "Product Designer & Manager. Hybrid role managing UX research, prototyping, and product specification writing. Led brainstorming workshops, user journey mapping, and defined launch success metrics.",
        "Product Management & Operations"
    ),

    # Finance & Business Analysis (10 samples)
    (
        "Financial Analyst with 4+ years of experience in corporate finance, financial modeling, budgeting, and variance analysis. Expert in Excel (macros, VLOOKUPs, pivot tables), SQL database queries, and Tableau. Prepared quarterly financial reports, revenue projections, and performed cost-benefit assessments for senior management.",
        "Finance & Business Analysis"
    ),
    (
        "Business Analyst with a focus on requirements gathering and process mapping. Experienced in Agile software lifecycles, documenting system specifications, writing business requirement documents (BRD), and creating UML diagrams. Expert in SQL, Jira, and MS Visio.",
        "Finance & Business Analysis"
    ),
    (
        "Investment Banking Analyst. Experienced in financial valuation, discounted cash flow (DCF) models, comparable company analysis (CCA), and merger modeling. Proficient in Bloomberg Terminal, Excel, PowerPoint, and financial statement analysis.",
        "Finance & Business Analysis"
    ),
    (
        "Data Business Analyst. Bridged the gap between data engineering and business users. Analyzed key business performance metrics (KPIs) using SQL, PowerBI, Excel, and python pandas. Documented data dictionaries and metadata schemas.",
        "Finance & Business Analysis"
    ),
    (
        "Risk Analyst. Developed risk assessment frameworks, evaluated credit risks, and performed compliance auditing. Experienced in Excel-based financial reporting, statistical probability modeling, and data extraction using SQL.",
        "Finance & Business Analysis"
    ),
    (
        "Management Consultant. Advised Fortune 500 clients on operational efficiency, cost reductions, and strategic growth. Expert in business presentation design, market research, Excel financial modeling, and slide deck creation.",
        "Finance & Business Analysis"
    ),
    (
        "Junior Financial Planner. Managed client portfolios, prepared retirement and investment strategies, and analyzed asset allocations. Proficient in tax planning software, Excel, and financial forecasting tools.",
        "Finance & Business Analysis"
    ),
    (
        "Business Process Analyst. Identified bottlenecks in corporate workflows, designed automated workflows (RPA), and mapped 'As-Is' vs. 'To-Be' business processes. Expert in BPMN, Lucidchart, and SQL data extraction.",
        "Finance & Business Analysis"
    ),
    (
        "Corporate Treasury Analyst. Monitored cash flows, managed foreign exchange (FX) risks, and coordinated banking relations. Proficient in ERP systems (SAP, Oracle Finance) and advanced Excel functions.",
        "Finance & Business Analysis"
    ),
    (
        "Market Research Analyst. Conducted competitor benchmarking, market sizing, and customer surveys. Expert in SPSS, Excel, market intelligence reports, and data visualization.",
        "Finance & Business Analysis"
    )
]
