// JavaScript für das Lebenslauf-Modal mit PDF.js Integration und Papierschnipsel-Zerfall

// Globale Referenzen für Timeouts
window.paperShredTimeouts = [];

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
    
    // Modal öffnen - Button verschwindet SOFORT bei Klick
    resumeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Vor dem Öffnen alten Inhalt komplett löschen
        if (pdfJsContainer) {
            pdfJsContainer.innerHTML = '';
            pdfJsContainer.removeAttribute('data-loaded');
        }
        
        // Alle alten Timeouts löschen
        if (window.paperShredTimeouts) {
            window.paperShredTimeouts.forEach(timeout => clearTimeout(timeout));
            window.paperShredTimeouts = [];
        }
        
        // Download-Button sofort ausblenden
        const downloadBtnElem = document.getElementById('download-resume');
        if (downloadBtnElem) {
            downloadBtnElem.style.display = 'none';
        }
        
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
            pagesWrapper.className = 'pages-wrapper';
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
            for (let pageNum = 1; pageNum <= 1; pageNum++) {
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
                const timeout1 = setTimeout(() => {
                    pageImages.forEach(img => {
                        img.canvas.style.filter = 'blur(12px)';
                    });
                }, 300);
                window.paperShredTimeouts.push(timeout1);
                
                // Nach 1.8 Sekunden (0.3 + 1.5): Papierschnipsel-Zerfall
                const timeout2 = setTimeout(() => {
                    startPaperShredEffect(pagesWrapper, pageImages, container);
                }, 1800);
                window.paperShredTimeouts.push(timeout2);
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
            'polygon(0% 0%, 100% 0%, 92% 12%, 100% 24%, 86% 36%, 100% 48%, 89% 60%, 100% 72%, 84% 84%, 100% 100%, 0% 100%, 8% 88%, 0% 76%, 14% 64%, 0% 52%, 11% 40%, 0% 28%, 16% 16%)',
            'polygon(0% 0%, 100% 0%, 100% 18%, 82% 28%, 100% 38%, 86% 48%, 100% 58%, 80% 68%, 100% 78%, 78% 88%, 100% 100%, 0% 100%, 14% 86%, 0% 74%, 18% 62%, 0% 50%, 22% 38%, 0% 26%, 10% 14%)',
            'polygon(0% 0%, 100% 0%, 95% 14%, 100% 28%, 90% 42%, 100% 56%, 88% 70%, 100% 84%, 86% 100%, 14% 100%, 0% 84%, 12% 70%, 0% 56%, 10% 42%, 0% 28%, 5% 14%)'
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
                const timeoutShredStart = setTimeout(() => {
                    shreds.forEach(({ shred, delay, distanceX, distanceY, flyRotation }) => {
                        const innerTimeout = setTimeout(() => {
                            shred.style.transform = `translate(${distanceX}px, ${distanceY}px) rotate(${flyRotation}deg)`;
                            shred.style.opacity = '0';
                        }, delay * 1000);
                        window.paperShredTimeouts.push(innerTimeout);
                    });
                }, 50);
                window.paperShredTimeouts.push(timeoutShredStart);
                
                // Nach Animation: Container entfernen und Platzhalter anzeigen
                const timeoutRemove = setTimeout(() => {
                    shredContainer.remove();
                    if (pageIndex === pageImages.length - 1) {
                        showPlaceholder(container);
                    }
                }, 3500);
                window.paperShredTimeouts.push(timeoutRemove);
            };
            
            img.src = imageData;
        });
        
        if (pageImages.length === 0) {
            showPlaceholder(container);
        }
    }
    
    // Platzhalter nach Zerfall anzeigen mit SVG-Schloss
    function showPlaceholder(container) {
        container.innerHTML = '';
        
        // Container für den Platzhalter
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-container';
        placeholder.style.height = '100%';
        placeholder.style.minHeight = '100%';
        
        // Inhalt (mit CSS-Klassen)
        const content = document.createElement('div');
        content.className = 'placeholder-content';

        content.innerHTML = `
            <svg class="lock-icon" width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <h3>Zugriff eingeschränkt.</h3>
            <p>Relevante Informationen werden kontextbasiert bereitgestellt.</p>
        `;
        
        placeholder.appendChild(content);
        container.appendChild(placeholder);
        
        // Glitzer-Effekt ist auskommentiert (bleibt so)
    }
    
    // Modal schließen mit vollständiger Bereinigung
    function closeModal() {
        modal.classList.remove('show');
        
        // 1. Alle Timeouts stoppen
        if (window.paperShredTimeouts) {
            window.paperShredTimeouts.forEach(timeout => clearTimeout(timeout));
            window.paperShredTimeouts = [];
        }
        
        // 2. PDF.js Container komplett leeren
        if (pdfJsContainer) {
            pdfJsContainer.innerHTML = '';
            pdfJsContainer.removeAttribute('data-loaded');
        }
        
        // 3. Eventuelle Wrapper leeren (falls noch vorhanden)
        const wrapper = document.querySelector('.pages-wrapper');
        if (wrapper) {
            wrapper.innerHTML = '';
        }
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Event-Listener für Modal-Schließen
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
    
    // Download-Funktion (wird durch das Ausblenden des Buttons nicht mehr benötigt, aber bleibt für die Struktur)
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const iosHintElem = document.getElementById('ios-download-hint');
        if (iosHintElem) {
            iosHintElem.style.display = 'block';
            iosHintElem.innerHTML = '<p style="color:#0a3d62;">📋 Der vollständige Lebenslauf ist nur auf persönliche Anfrage verfügbar. Kontaktieren Sie mich gerne!</p>';
            setTimeout(() => {
                iosHintElem.style.display = 'none';
                iosHintElem.innerHTML = '';
            }, 4000);
        }
    });
});
