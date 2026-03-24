// JavaScript für das Lebenslauf-Modal mit PDF.js Integration und Papierschnipsel-Zerfall

document.addEventListener('DOMContentLoaded', function() {
    // Referenzen zu den Elementen
    const resumeBtn = document.querySelector('.resume-btn');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('download-resume');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfIframe = document.getElementById('pdf-iframe');
    const pdfJsContainer = document.getElementById('pdfjs-container');
    const modalTitle = document.querySelector('#resume-modal .modal-title');
    const downloadText = document.querySelector('#download-resume span');
    const iosHint = document.getElementById('ios-download-hint');
    
    // Erkennung von iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // PDF.js Worker konfigurieren
    if (isIOS || isSafari) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }
    
    // Übersetzungsfunktion für das Modal
    function updateModalTranslations(lang) {
        if (modalTitle) modalTitle.textContent = translations[lang]['resume_title'];
        if (downloadText) downloadText.textContent = translations[lang]['resume_download'];
        if (iosHint) iosHint.textContent = translations[lang]['resume_ios_hint'];
    }
    
    // Event-Listener für Sprachänderungen
    document.addEventListener('languageChanged', function(e) {
        updateModalTranslations(e.detail.language);
    });
    
    // Modal öffnen
    resumeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const currentLang = document.documentElement.getAttribute('lang') || 'de';
        updateModalTranslations(currentLang);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        pdfIframe.style.display = 'none';
        pdfJsContainer.style.display = 'block';
        
        if (!pdfJsContainer.hasAttribute('data-loaded')) {
            loadPdfWithBlurAndPaperShred('assets/pdf/Lebenslauf_AstridKraft.pdf', pdfJsContainer);
            pdfJsContainer.setAttribute('data-loaded', 'true');
        }
    });
    
    // PDF laden mit kurz unscharf + Papierschnipsel-Zerfall
    function loadPdfWithBlurAndPaperShred(url, container) {
        container.innerHTML = '<p style="padding:2rem; text-align:center;">PDF wird geladen...</p>';
        
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
            container.innerHTML = '';
            
            // Wrapper für alle Seiten
            const pagesWrapper = document.createElement('div');
            pagesWrapper.style.position = 'relative';
            pagesWrapper.style.width = '100%';
            pagesWrapper.style.maxHeight = '70vh';
            pagesWrapper.style.overflowY = 'auto';
            pagesWrapper.style.overflowX = 'hidden';
            pagesWrapper.style.borderRadius = '8px';
            pagesWrapper.style.backgroundColor = '#f0f0f0';
            
            container.appendChild(pagesWrapper);
            
            const pageImages = [];
            const loadPromises = [];
            
            // Alle PDF-Seiten laden
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                loadPromises.push(
                    pdf.getPage(pageNum).then(function(page) {
                        const viewport = page.getViewport({ scale: 1.8 });
                        
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        canvas.style.width = '100%';
                        canvas.style.height = 'auto';
                        canvas.style.marginBottom = '10px';
                        canvas.style.border = '1px solid #e0e0e0';
                        canvas.style.borderRadius = '4px';
                        canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        canvas.style.transition = 'filter 0.3s ease';
                        
                        const pageContainer = document.createElement('div');
                        pageContainer.className = 'pdf-page';
                        pageContainer.style.position = 'relative';
                        pageContainer.appendChild(canvas);
                        pagesWrapper.appendChild(pageContainer);
                        
                        return page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise.then(() => {
                            pageImages.push({
                                canvas: canvas,
                                container: pageContainer,
                                width: canvas.width,
                                height: canvas.height,
                                rect: null
                            });
                        });
                    })
                );
            }


Promise.all(loadPromises).then(() => {
    // Zuerst scharf anzeigen (kein Blur)
    pageImages.forEach(img => {
        img.canvas.style.filter = 'blur(0px)';
        img.canvas.style.transition = 'filter 0.8s ease';
    });
    
    // Nach 0.3 Sekunden: langsam unscharf werden
    setTimeout(() => {
        pageImages.forEach(img => {
            img.canvas.style.filter = 'blur(12px)';
        });
    }, 300);
    
    // Nach 1.8 Sekunden (0.3 + 1.5): Papierschnipsel-Zerfall
    setTimeout(() => {
        startPaperShredEffect(pagesWrapper, pageImages, container);
    }, 1800);
});
            
     
            
        }).catch(function(error) {
            container.innerHTML = `<p style="padding:2rem; text-align:center; color:red;">
                Fehler beim Laden der PDF: ${error.message || error}<br>
                <a href="assets/pdf/Lebenslauf_AstridKraft.pdf" target="_blank" style="color:blue;">PDF direkt öffnen</a>
            </p>`;
        });
    }
    
    // Papierschnipsel-Zerfall-Effekt mit gezackten Rändern (wie echtes zerrissenes Papier)
    function startPaperShredEffect(wrapper, pageImages, container) {
        const wrapperRect = wrapper.getBoundingClientRect();
        
        // Verschiedene gezackte Papierriss-Formen (echte Papierkanten)
        const paperShapes = [
            'polygon(0% 3%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 97%)',
            'polygon(0% 8%, 12% 0%, 88% 0%, 100% 10%, 100% 90%, 88% 100%, 12% 100%, 0% 92%)',
            'polygon(0% 0%, 100% 0%, 92% 100%, 8% 100%)',
            'polygon(0% 5%, 10% 0%, 90% 0%, 100% 8%, 100% 92%, 90% 100%, 10% 100%, 0% 95%)',
            'polygon(0% 12%, 18% 0%, 82% 0%, 100% 15%, 100% 85%, 82% 100%, 18% 100%, 0% 88%)',
            'polygon(0% 0%, 85% 0%, 100% 20%, 100% 80%, 85% 100%, 15% 100%, 0% 80%, 0% 20%)',
            'polygon(0% 7%, 7% 0%, 93% 0%, 100% 7%, 100% 93%, 93% 100%, 7% 100%, 0% 93%)',
            'polygon(0% 0%, 100% 0%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)'
        ];
        
        pageImages.forEach((page, pageIndex) => {
            const canvas = page.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            const relativeTop = canvasRect.top - wrapperRect.top;
            const relativeLeft = canvasRect.left - wrapperRect.left;
            
            // Original-Canvas ausblenden
            canvas.style.opacity = '0';
            canvas.style.transition = 'opacity 0.2s';
            
            // Bilddaten vom Canvas holen
            const imageData = canvas.toDataURL('image/png');
            
            // Schnipsel-Container
            const shredContainer = document.createElement('div');
            shredContainer.style.position = 'absolute';
            shredContainer.style.top = relativeTop + 'px';
            shredContainer.style.left = relativeLeft + 'px';
            shredContainer.style.width = canvasRect.width + 'px';
            shredContainer.style.height = canvasRect.height + 'px';
            shredContainer.style.overflow = 'visible';
            shredContainer.style.pointerEvents = 'none';
            shredContainer.style.zIndex = '15';
            wrapper.appendChild(shredContainer);
            
            // Schnipsel erzeugen (wie zerrissene Papierstücke)
            const shredCount = 80;
            const shreds = [];
            
            // Bild laden für Schnipsel
            const img = new Image();
            img.onload = function() {
                // Temporäres Canvas für Bilddaten
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Zufällige Schnipsel-Positionen und -Größen
                for (let i = 0; i < shredCount; i++) {
                    // Zufällige Größe (35-110px breit, 25-70px hoch)
                    const shredWidth = 35 + Math.random() * 75;
                    const shredHeight = 25 + Math.random() * 45;
                    
                    // Zufällige Position im Dokument
                    const posX = Math.random() * (canvasRect.width - shredWidth);
                    const posY = Math.random() * (canvasRect.height - shredHeight);
                    
                    // Entsprechende Position im Original-Canvas
                    const srcX = Math.floor((posX / canvasRect.width) * canvas.width);
                    const srcY = Math.floor((posY / canvasRect.height) * canvas.height);
                    const srcW = Math.floor((shredWidth / canvasRect.width) * canvas.width);
                    const srcH = Math.floor((shredHeight / canvasRect.height) * canvas.height);
                    
                    // Schnipsel-Bild aus dem Canvas extrahieren
                    const shredCanvas = document.createElement('canvas');
                    shredCanvas.width = srcW;
                    shredCanvas.height = srcH;
                    const shredCtx = shredCanvas.getContext('2d');
                    shredCtx.drawImage(tempCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
                    
                    // Zufällige gezackte Form auswählen
                    const randomShape = paperShapes[Math.floor(Math.random() * paperShapes.length)];
                    
                    // Zufällige Anfangsrotation (damit Schnipsel unregelmäßig liegen)
                    const initialRotation = (Math.random() - 0.5) * 12;
                    
                    // DOM-Element für Schnipsel
                    const shred = document.createElement('div');
                    shred.style.position = 'absolute';
                    shred.style.left = posX + 'px';
                    shred.style.top = posY + 'px';
                    shred.style.width = shredWidth + 'px';
                    shred.style.height = shredHeight + 'px';
                    shred.style.backgroundImage = `url(${shredCanvas.toDataURL()})`;
                    shred.style.backgroundSize = 'cover';
                    shred.style.backgroundPosition = 'center';
                    shred.style.boxShadow = '2px 3px 8px rgba(0,0,0,0.3)';
                    shred.style.transformOrigin = 'center center';
                    shred.style.transform = `rotate(${initialRotation}deg)`;
                    shred.style.transition = 'all 5.0s cubic-bezier(0.3, 0.8, 0.4, 1.1)';
                    // WICHTIG: clipPath nach dem backgroundImage setzen
                    shred.style.clipPath = randomShape;
                    shred.style.webkitClipPath = randomShape;
                    
                    // Zufällige Flugrichtung und Rotation
                    const angle = Math.random() * Math.PI * 2;
                    const distanceX = (Math.random() - 0.5) * 280 + (Math.random() - 0.5) * 120;
                    const distanceY = (Math.random() - 0.5) * 200 - 100;
                    const flyRotation = (Math.random() - 0.5) * 720 + (Math.random() - 0.5) * 180;
                    const delay = Math.random() * 0.5;
                    
                    shred.style.setProperty('--dx', distanceX + 'px');
                    shred.style.setProperty('--dy', distanceY + 'px');
                    shred.style.setProperty('--rot', flyRotation + 'deg');
                    shred.style.setProperty('--delay', delay + 's');
                    
                    shredContainer.appendChild(shred);
                    shreds.push({ shred, delay, distanceX, distanceY, flyRotation });
                }
                
                // Animation starten: Schnipsel fliegen weg
                setTimeout(() => {
                    shreds.forEach(({ shred, delay, distanceX, distanceY, flyRotation }) => {
                        setTimeout(() => {
                            shred.style.transform = `translate(${distanceX}px, ${distanceY}px) rotate(${flyRotation}deg)`;
                            shred.style.opacity = '0';
                        }, delay * 1000);
                    });
                }, 50);
                
                // Nach Animation: Container entfernen und Platzhalter anzeigen
                setTimeout(() => {
                    shredContainer.remove();
                    if (pageIndex === pageImages.length - 1) {
                        showPlaceholder(container);
                    }
                }, 3500);
            };
            
            img.src = imageData;
        });
        
        if (pageImages.length === 0) {
            showPlaceholder(container);
        }
    }

// Platzhalter nach Zerfall anzeigen mit animierten Partikeln
function showPlaceholder(container) {
    container.innerHTML = '';
    
    // Container für den Platzhalter
    const placeholder = document.createElement('div');
    placeholder.style.position = 'relative';
    placeholder.style.padding = '3rem 2rem';
    placeholder.style.textAlign = 'center';
    placeholder.style.backgroundColor = '#f8f9fa';
    placeholder.style.borderRadius = '12px';
    placeholder.style.border = '2px dashed #0a3d62';
    placeholder.style.margin = '1rem';
    placeholder.style.overflow = 'hidden';
    placeholder.style.minHeight = '400px';
    placeholder.style.display = 'flex';
    placeholder.style.flexDirection = 'column';
    placeholder.style.justifyContent = 'center';
    placeholder.style.alignItems = 'center';
    placeholder.style.animation = 'fadeIn 0.5s ease';
    
    // Canvas für Partikel-Hintergrund
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    placeholder.appendChild(canvas);
    
    // Inhalt (über dem Canvas)
    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.zIndex = '1';
    content.style.padding = '2rem';
    
    content.innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 8px rgba(0,255,255,0.3));">🔒</div>
        <h3 style="color: #0a3d62; margin-bottom: 1rem; font-size: 1.5rem;">Zugriff eingeschränkt.</h3>
        <p style="color: #555; font-size: 1rem; max-width: 350px; margin: 0 auto; line-height: 1.6;">
            Relevante Informationen werden kontextbasiert bereitgestellt.
        </p>
    `;
    
    placeholder.appendChild(content);
    container.appendChild(placeholder);
    
    // Partikel-Animation
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let width = 0, height = 0;
    
    function resizeCanvas() {
        const rect = placeholder.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
    }
    
    function createParticles() {
        const particleCount = 80;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 2 + Math.random() * 4,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.3 + 0.2,
                opacity: 0.3 + Math.random() * 0.5,
                color: `rgba(0, 255, 255, ${0.4 + Math.random() * 0.4})`
            });
        }
    }
    
    function drawParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Kleinen Glow-Effekt
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Bewegung
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Reset wenn aus dem Bild
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;
        });
        
        animationId = requestAnimationFrame(drawParticles);
    }
    
    function initParticles() {
        resizeCanvas();
        createParticles();
        drawParticles();
    }
    
    // Bei Größenänderung neu skalieren
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
        createParticles();
    });
    resizeObserver.observe(placeholder);
    
    initParticles();
    
    // Animation stoppen wenn Modal geschlossen wird
    const modal = document.getElementById('resume-modal');
    const closeModalHandler = function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        resizeObserver.disconnect();
    };
    
    // Event-Listener für Modal-Schließen
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModalHandler);
    }
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModalHandler();
    });
    
    // Download-Button deaktivieren
    const downloadBtn = document.getElementById('download-resume');
    if (downloadBtn) {
        downloadBtn.style.opacity = '0.5';
        downloadBtn.style.pointerEvents = 'none';
        downloadBtn.title = 'Lebenslauf nur auf persönliche Anfrage';
    }
}





