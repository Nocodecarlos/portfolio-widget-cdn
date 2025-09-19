(function(c,p){typeof exports=="object"&&typeof module<"u"?p(exports):typeof define=="function"&&define.amd?define(["exports"],p):(c=typeof globalThis<"u"?globalThis:c||self,p(c.PortfolioProgress={}))})(this,function(c){"use strict";class p{constructor(e){this.sections=[],this.readSections=new Set,this.dwellTimers=new Map,this.lastScrollTime=0,this.lastScrollY=0,this.pageCompleted=!1,this.siteCompletedShown=!1,this.config=e,this.currentPageId=window.location.pathname,this.init()}init(){this.injectStyles(),this.setupObservers(),this.createWidget(),this.loadPageProgress(),this.updateWidget()}injectStyles(){if(document.getElementById("portfolio-progress-styles"))return;const e=`
      .pp-widget {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 20px;
        z-index: 9999;
        font-family: "Inter Display", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-weight: 600;
        font-size: 11px;
        line-height: 15px;
        color: #000000;
        pointer-events: auto;
        transition: opacity 0.3s ease;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
      }
      
      .pp-progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: linear-gradient(90deg, #6CCEFC 0%, rgba(108, 206, 252, 0.75) 100%);
        border-radius: 0px 0px 4px 0px;
        transition: width 0.3s ease;
        width: 0%;
      }
      
      .pp-progress-text {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        display: flex;
        align-items: center;
        padding: 0 12px;
        font-weight: 600;
        font-size: 11px;
        color: #000000;
        z-index: 1;
        pointer-events: none;
      }
      
      .pp-widget:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .pp-widget:focus {
        outline: 2px solid ${this.config.theme.primary};
        outline-offset: -2px;
      }
      
      .pp-panel {
        position: absolute;
        top: 100%;
        right: 24px;
        margin-top: 8px;
        width: 280px;
        padding: 20px;
        background: ${this.config.theme.bg};
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: ${this.config.theme.radius}px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(-10px);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        color: ${this.config.theme.text};
        font-size: 14px;
        line-height: 1.5;
      }
      
      .pp-panel.pp-open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      
      .pp-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      
      .pp-modal.pp-open {
        opacity: 1;
        pointer-events: auto;
      }
      
      .pp-modal-content {
        background: white;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        max-width: 400px;
        margin: 20px;
        color: #333;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .pp-modal.pp-open .pp-modal-content {
        transform: scale(1);
      }
      
      .pp-modal h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
        font-weight: 700;
      }
      
      .pp-modal p {
        margin: 0 0 24px 0;
        opacity: 0.8;
      }
      
      .pp-modal button {
        background: ${this.config.theme.primary};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .pp-modal button:hover {
        transform: translateY(-1px);
      }
      
      .pp-modal button:focus {
        outline: 2px solid ${this.config.theme.primary};
        outline-offset: 2px;
      }
      
      @media (max-width: 480px) {
        .pp-widget {
          height: 18px;
        }
        
        .pp-progress-text {
          padding: 0 10px;
          font-size: 10px;
        }
        
        .pp-panel {
          width: 240px;
          right: 12px;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .pp-widget, .pp-progress-fill, .pp-panel, .pp-modal, .pp-modal-content {
          transition: none;
        }
      }
    `,t=document.createElement("style");t.id="portfolio-progress-styles",t.textContent=e,document.head.appendChild(t)}setupObservers(){"IntersectionObserver"in window&&(this.intersectionObserver=new IntersectionObserver(e=>this.handleIntersection(e),{threshold:this.config.threshold}),this.footerObserver=new IntersectionObserver(e=>this.handleFooterIntersection(e),{threshold:.1})),this.observeSections(),this.setupScrollTracking(),this.setupVisibilityTracking()}observeSections(){this.sections=Array.from(document.querySelectorAll(this.config.sectionSelector)),this.intersectionObserver&&this.sections.forEach(t=>this.intersectionObserver.observe(t));const e=document.querySelector(this.config.footerSelector);e&&this.footerObserver&&this.footerObserver.observe(e)}handleIntersection(e){document.hidden||e.forEach(t=>{const o=this.sections.indexOf(t.target);o!==-1&&(t.isIntersecting&&t.intersectionRatio>=this.config.threshold?this.startDwellTimer(o):this.stopDwellTimer(o))})}handleFooterIntersection(e){e.forEach(t=>{t.isIntersecting&&this.completeCurrentPage()})}startDwellTimer(e){this.readSections.has(e)||this.isScrollingFast()||(this.stopDwellTimer(e),this.dwellTimers.set(e,setTimeout(()=>{this.readSections.add(e),this.checkPageCompletion(),this.updateWidget(),this.savePageProgress()},this.config.dwellSeconds*1e3)))}stopDwellTimer(e){const t=this.dwellTimers.get(e);t&&(clearTimeout(t),this.dwellTimers.delete(e))}isScrollingFast(){const e=Date.now(),t=window.scrollY;return e-this.lastScrollTime<100&&Math.abs(t-this.lastScrollY)/(e-this.lastScrollTime)>6?!0:(this.lastScrollTime=e,this.lastScrollY=t,!1)}setupScrollTracking(){let e;window.addEventListener("scroll",()=>{clearTimeout(e),e=setTimeout(()=>{this.updateWidget()},100)},{passive:!0})}setupVisibilityTracking(){document.addEventListener("visibilitychange",()=>{document.hidden&&(this.dwellTimers.forEach(e=>clearTimeout(e)),this.dwellTimers.clear())})}checkPageCompletion(){if(this.pageCompleted)return;(this.sections.length>0?this.readSections.size/this.sections.length:0)>=this.config.pageCompletionPct&&this.completeCurrentPage()}completeCurrentPage(){this.pageCompleted||(this.pageCompleted=!0,this.savePageProgress(),this.updateWidget(),this.checkSiteCompletion())}async checkSiteCompletion(){this.getSiteProgress().percent>=100&&!this.siteCompletedShown&&(this.siteCompletedShown=!0,this.saveSiteCompletion(),window.matchMedia("(prefers-reduced-motion: reduce)").matches||await this.showConfetti(),this.showCompletionModal())}async showConfetti(){try{window.confetti||await new Promise((t,o)=>{const i=document.createElement("script");i.src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js",i.onload=t,i.onerror=o,document.head.appendChild(i)});const e=window.confetti;e({particleCount:100,spread:70,origin:{y:.6}}),setTimeout(()=>{e({particleCount:50,angle:60,spread:55,origin:{x:0}})},250),setTimeout(()=>{e({particleCount:50,angle:120,spread:55,origin:{x:1}})},400)}catch{console.warn("Portfolio Progress: Could not load confetti library")}}showCompletionModal(){var i;const e=document.createElement("div");e.className="pp-modal",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-labelledby","pp-modal-title"),e.innerHTML=`
      <div class="pp-modal-content">
        <h2 id="pp-modal-title">${this.config.copy.completeTitle||"You did it! 🎉"}</h2>
        <p>${this.config.copy.completeBody||"Thanks for reading the whole portfolio."}</p>
        <button type="button" aria-label="Close celebration modal">${this.config.copy.ctaLabel||"Yay!"}</button>
      </div>
    `,document.body.appendChild(e);const t=document.activeElement;requestAnimationFrame(()=>{e.classList.add("pp-open");const s=e.querySelector("button");s&&s.focus()});const o=()=>{e.classList.remove("pp-open"),setTimeout(()=>{document.body.removeChild(e),t&&t.focus()},300)};(i=e.querySelector("button"))==null||i.addEventListener("click",o),e.addEventListener("click",s=>{s.target===e&&o()}),document.addEventListener("keydown",function s(l){l.key==="Escape"&&(o(),document.removeEventListener("keydown",s))})}createWidget(){this.widget=document.createElement("div"),this.widget.className="pp-widget",this.widget.setAttribute("role","button"),this.widget.setAttribute("tabindex","0"),this.widget.setAttribute("aria-label","Reading progress"),this.widget.style.display="block",this.widget.style.visibility="visible";const e=document.createElement("div");e.className="pp-progress-fill";const t=document.createElement("div");t.className="pp-progress-text",t.setAttribute("aria-live","polite");const o=document.createElement("div");o.className="pp-panel",o.setAttribute("role","tooltip"),this.widget.appendChild(e),this.widget.appendChild(t),this.widget.appendChild(o);const i=()=>{o.classList.toggle("pp-open"),this.updatePanel()};this.widget.addEventListener("click",i),this.widget.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),i())}),document.addEventListener("click",s=>{var l;(l=this.widget)!=null&&l.contains(s.target)||o.classList.remove("pp-open")}),document.body.appendChild(this.widget),console.log("Widget created and appended to body:",this.widget)}updateWidget(){if(!this.widget)return;const e=this.getPageProgress(),t=this.getSiteProgress(),o=this.widget.querySelector(".pp-progress-fill"),i=this.widget.querySelector(".pp-progress-text");if(o&&i){const s=e.sectionsFound>0?Math.round(e.sectionsRead/e.sectionsFound*100):e.pageCompleted?100:0;o.style.width=`${t.percent}%`,i.textContent=`Progress: ${t.percent}%`,i.setAttribute("aria-label",`Site reading progress: ${t.percent}%. Current page: ${s}%`)}}updatePanel(){var s;const e=(s=this.widget)==null?void 0:s.querySelector(".pp-panel");if(!e)return;const t=this.getPageProgress(),o=this.getSiteProgress(),i=t.sectionsFound>0?Math.round(t.sectionsRead/t.sectionsFound*100):t.pageCompleted?100:0;e.innerHTML=`
      <div style="margin-bottom: 12px;">
        <strong>Current Page</strong><br>
        ${i}% (${t.sectionsRead}/${t.sectionsFound} sections)
      </div>
      <div>
        <strong>Site Progress</strong><br>
        ${o.percent}% (${o.pagesCompleted}/${o.totalCountedPages} pages)
      </div>
    `}loadPageProgress(){const e=`pp:v1:${this.config.siteVersion}:${this.currentPageId}`,t=localStorage.getItem(e);if(t)try{const s=JSON.parse(t);this.readSections=new Set(s.readSections||[]),this.pageCompleted=s.pageCompleted||!1}catch{console.warn("Portfolio Progress: Could not parse saved progress")}const o=`pp:v1:${this.config.siteVersion}:site`,i=localStorage.getItem(o);if(i)try{const s=JSON.parse(i);this.siteCompletedShown=s.completedShown||!1}catch{}}savePageProgress(){const e=`pp:v1:${this.config.siteVersion}:${this.currentPageId}`,t={readSections:Array.from(this.readSections),pageCompleted:this.pageCompleted,timestamp:Date.now()};localStorage.setItem(e,JSON.stringify(t))}saveSiteCompletion(){const e=`pp:v1:${this.config.siteVersion}:site`,t={completedShown:!0,timestamp:Date.now()};localStorage.setItem(e,JSON.stringify(t))}matchesCountedPage(e){return this.config.countedPages.some(t=>t.includes("*")?new RegExp("^"+t.replace(/\*/g,".*")+"$").test(e):t===e)}getPageProgress(){return{pageId:this.currentPageId,sectionsFound:this.sections.length,sectionsRead:this.readSections.size,pageCompleted:this.pageCompleted}}getSiteProgress(){const e=this.config.countedPages;let t=0;e.forEach(a=>{if(a.includes("*")){for(const r of Object.keys(localStorage))if(r.startsWith(`pp:v1:${this.config.siteVersion}:`)&&!r.endsWith(":site")){const n=r.replace(`pp:v1:${this.config.siteVersion}:`,"");if(new RegExp("^"+a.replace(/\*/g,".*")+"$").test(n))try{JSON.parse(localStorage.getItem(r)||"{}").pageCompleted&&t++}catch{}}}else{const r=`pp:v1:${this.config.siteVersion}:${a}`,n=localStorage.getItem(r);if(n)try{JSON.parse(n).pageCompleted&&t++}catch{}}});const o=new Set;e.forEach(a=>{if(a.includes("*")){for(const r of Object.keys(localStorage))if(r.startsWith(`pp:v1:${this.config.siteVersion}:`)&&!r.endsWith(":site")){const n=r.replace(`pp:v1:${this.config.siteVersion}:`,"");if(new RegExp("^"+a.replace(/\*/g,".*")+"$").test(n))try{JSON.parse(localStorage.getItem(r)||"{}").pageCompleted&&o.add(n)}catch{}}}else{const r=`pp:v1:${this.config.siteVersion}:${a}`,n=localStorage.getItem(r);if(n)try{JSON.parse(n).pageCompleted&&o.add(a)}catch{}}});const i=e.length,s=o.size,l=Math.round(i>0?s/i*100:0);return{totalCountedPages:i,pagesCompleted:s,percent:l}}resetPage(){const e=`pp:v1:${this.config.siteVersion}:${this.currentPageId}`;localStorage.removeItem(e),this.readSections.clear(),this.pageCompleted=!1,this.dwellTimers.forEach(t=>clearTimeout(t)),this.dwellTimers.clear(),this.updateWidget()}resetSite(){const e=`pp:v1:${this.config.siteVersion}:`,t=[];for(let o=0;o<localStorage.length;o++){const i=localStorage.key(o);i&&i.startsWith(e)&&t.push(i)}t.forEach(o=>localStorage.removeItem(o)),this.siteCompletedShown=!1,this.resetPage()}destroy(){this.intersectionObserver&&this.intersectionObserver.disconnect(),this.footerObserver&&this.footerObserver.disconnect(),this.dwellTimers.forEach(t=>clearTimeout(t)),this.dwellTimers.clear(),this.widget&&this.widget.remove();const e=document.getElementById("portfolio-progress-styles");e&&e.remove()}}const h={siteVersion:"1.0.0",countedPages:[],sectionSelector:"h3, [data-read-chunk]",footerSelector:"footer, [data-page-footer]",threshold:.5,dwellSeconds:2.5,pageCompletionPct:.7,theme:{position:"br",primary:"#6CCEFC",bg:"rgba(255,255,255,0.06)",text:"#EAF6FF",radius:14,mode:"auto",minWidth:320,maxWidth:4e3},copy:{completeTitle:"You did it! 🎉",completeBody:"Thanks for reading the whole portfolio.",ctaLabel:"Yay!"}};function f(g={}){const e={...h,...g};if(!e.siteVersion)throw new Error("PortfolioProgress: siteVersion is required");return e.countedPages.length===0&&console.warn("PortfolioProgress: No countedPages specified"),e.theme={...h.theme,...g.theme},e.copy={...h.copy,...g.copy},console.log("PortfolioProgress initializing with config:",e),new p(e)}typeof window<"u"&&window.addEventListener("DOMContentLoaded",()=>{window.PortfolioProgressConfig&&f(window.PortfolioProgressConfig)});const u={init:f};typeof window<"u"&&(window.PortfolioProgress=u);const w=f;c.default=u,c.portfolioProgressInit=w,Object.defineProperties(c,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
