let windows = []
currentZIndex = 1000;

windowTemplate = `<div class="title-bar" style="background-color:rgb(177, 112, 231); color: white; padding: 5px; cursor: move; user-select: none;">
    <span class="title">Loading...</span>
    <button class="close-button" style="float: right; background: rgb(215, 97, 97); color: white; border: none; cursor: pointer;">X</button>
    <button class="minimize-button" style="float: right; background: rgb(240, 220, 131); color: black; border: none; cursor: pointer;">_</button>
</div>
<div class="content">
    <iframe class="iframe" src="WINDOW_URL" referrerpolicy="no-referrer" style="width: 100%; height: 100%; border: none;"></iframe>
</div>`

function disableSelect(event) {
    event.preventDefault();
}

function distance2D(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function makeWindow(windowElement) {
    windowElement.querySelector('.iframe').addEventListener('load', () => {
        const titleText = windowElement.querySelector('.title');
        
        let tittleSetter = setInterval(() => {
            try {
                const title = windowElement.querySelector('.iframe').contentWindow.document.title || "Loading...";
            } catch (e) { // CORS / CSP block D:
                titleText.innerText = "Website";
                clearInterval(tittleSetter);
            }
            const maxChars = titleText.width / 10;

            if (title.length > maxChars) {
                titleText.innerText = title.substring(0, maxChars) + '...';
            } else {
                titleText.innerText = title;
            }
        }, 1000);
    
    });

    windowElement.querySelector('.close-button').addEventListener('click', () => {
        deleteWindow(windowElement);
    });

    windowElement.querySelector('.minimize-button').addEventListener('click', () => {
        let windowContent = windowElement.querySelector('.content');
        let iframe = windowElement.querySelector('iframe');
        if (windowContent.style.display === 'none') {
            windowContent.style.display = 'block';
            iframe.style.display = 'block';
            windowElement.style.height = 'auto';
        } else {
            windowContent.style.display = 'none';
            iframe.style.display = 'none';
            windowElement.style.height = (windowElement.querySelector('.title-bar').offsetHeight - 1) + 'px';
        }
    });

    windowElement.addEventListener('mousedown', (e) => {
        windowElement.style.zIndex = currentZIndex + 1;
        currentZIndex = currentZIndex + 1;
    });

    windowElement.querySelector('.title-bar').addEventListener('mousedown', (e) => {
        windowElement.isDragging = true;
        windowElement.initialX = e.clientX - windowElement.offsetLeft;
        windowElement.initialY = e.clientY - windowElement.offsetTop;

        document.addEventListener('selectstart', disableSelect);
        document.addEventListener('mousemove', drag);
    });

    windowElement.querySelector('.title-bar').addEventListener('mouseup', () => {
        windowElement.isDragging = false;
        document.removeEventListener('selectstart', disableSelect);
        document.removeEventListener('mousemove', drag);
    });

    windowElement.addEventListener('mousemove', (e) => {
        boundingRect = windowElement.getBoundingClientRect();
        windowElement.topLeft = distance2D(boundingRect.left, boundingRect.top, e.clientX, e.clientY);
        windowElement.topRight = distance2D(boundingRect.right, boundingRect.top, e.clientX, e.clientY);
        windowElement.bottomLeft = distance2D(boundingRect.left, boundingRect.bottom, e.clientX, e.clientY);
        windowElement.bottomRight = distance2D(boundingRect.right, boundingRect.bottom, e.clientX, e.clientY);

        if (!windowElement.isResizing && !windowElement.isDragging) {
            if (windowElement.topLeft < 20) {
                windowElement.style.cursor = 'nw-resize';
            } else if (windowElement.topRight < 20) {
                windowElement.style.cursor = 'ne-resize';
            } else if (windowElement.bottomLeft < 20) {
                windowElement.style.cursor = 'sw-resize';
            } else if (windowElement.bottomRight < 20) {
                windowElement.style.cursor = 'se-resize';
            } else {
                windowElement.style.cursor = 'default';
            }
        }
    });

    windowElement.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.title-bar') && 
            (windowElement.topLeft < 20 || windowElement.topRight < 20 || 
             windowElement.bottomLeft < 20 || windowElement.bottomRight < 20)) {

            if (windowElement.topLeft < 20) {
                windowElement.resizeDirection = 'nw-resize';
            } else if (windowElement.topRight < 20) {
                windowElement.resizeDirection = 'ne-resize';
            } else if (windowElement.bottomLeft < 20) {
                windowElement.resizeDirection = 'sw-resize';
            } else if (windowElement.bottomRight < 20) {
                windowElement.resizeDirection = 'se-resize';
            }
            
            windowElement.isResizing = true;
            windowElement.initialX = e.clientX;
            windowElement.initialY = e.clientY;
            windowElement.originalWidth = windowElement.offsetWidth;
            windowElement.originalHeight = windowElement.offsetHeight;
            windowElement.originalLeft = windowElement.offsetLeft;
            windowElement.originalTop = windowElement.offsetTop;
            
            document.addEventListener('selectstart', disableSelect);
            document.addEventListener('mousemove', resize);
            
            document.addEventListener('mouseup', stopResize);
            
            e.stopPropagation();
        }
    });

    function stopResize() {
        windowElement.isResizing = false;
        document.removeEventListener('selectstart', disableSelect);
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    function drag(e) {
        if (windowElement.isDragging) {
            windowElement.style.left = `${e.clientX - windowElement.initialX}px`;
            windowElement.style.top = `${e.clientY - windowElement.initialY}px`;

        }
    }

    function resize(e) {
        if (windowElement.isResizing) {
            const deltaX = e.clientX - windowElement.initialX;
            const deltaY = e.clientY - windowElement.initialY;
            let newWidth, newHeight, newLeft, newTop;
            
            if (windowElement.resizeDirection === 'nw-resize') {
                newWidth = Math.max(200, windowElement.originalWidth - deltaX);
                newHeight = Math.max(150, windowElement.originalHeight - deltaY);
                newLeft = windowElement.originalLeft + windowElement.originalWidth - newWidth;
                newTop = windowElement.originalTop + windowElement.originalHeight - newHeight;
                
                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;
            } else if (windowElement.resizeDirection === 'ne-resize') {
                newWidth = Math.max(200, windowElement.originalWidth + deltaX);
                newHeight = Math.max(150, windowElement.originalHeight - deltaY);
                newTop = windowElement.originalTop + windowElement.originalHeight - newHeight;
                
                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
                windowElement.style.top = `${newTop}px`;
            } else if (windowElement.resizeDirection === 'sw-resize') {
                newWidth = Math.max(200, windowElement.originalWidth - deltaX);
                newHeight = Math.max(150, windowElement.originalHeight + deltaY);
                newLeft = windowElement.originalLeft + windowElement.originalWidth - newWidth;
                
                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
                windowElement.style.left = `${newLeft}px`;
            } else if (windowElement.resizeDirection === 'se-resize') {
                newWidth = Math.max(200, windowElement.originalWidth + deltaX);
                newHeight = Math.max(150, windowElement.originalHeight + deltaY);
                
                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
            }

            const titleBarHeight = windowElement.querySelector('.title-bar').offsetHeight;
            const iframe = windowElement.querySelector('iframe');
            iframe.style.width = '100%';
            iframe.style.height = `${windowElement.offsetHeight - titleBarHeight}px`;
        }
    }
}

function deleteWindow(windowElement) {
    if (windowElement) {
        document.body.removeChild(windowElement);
        windows = windows.filter(win => win !== windowElement);
    }
}

function createWindow(url) {
    const windowId = `window-${windows.length}`;
    let  newWindow = windowTemplate.replace(/WINDOW_ID/g, windowId);
    newWindow = newWindow.replace(/WINDOW_URL/g, url);
    const newWindowElement = document.createElement('div');
    newWindowElement.class = 'window';
    newWindowElement.id = windowId;
    newWindowElement.style.position = 'fixed';
    newWindowElement.style.width = '200px';
    newWindowElement.style.height = 'auto';
    newWindowElement.style.left = '100px';
    newWindowElement.style.top = '100px';
    newWindowElement.style.border = '1px solid black';
    newWindowElement.style.zIndex = currentZIndex;
    newWindowElement.style.backgroundColor = 'white';
    newWindowElement.style.color = 'black';
    newWindowElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    newWindowElement.style.overflow = 'hidden';
    currentZIndex = currentZIndex + 1;
    
    newWindowElement.innerHTML = newWindow;

    document.body.appendChild(newWindowElement);
    windows.push(newWindowElement);

    makeWindow(newWindowElement);
}

const windowCreateButton = document.createElement('button');
windowCreateButton.innerText = '+';
windowCreateButton.style.position = 'fixed';
windowCreateButton.style.bottom = '20px';
windowCreateButton.style.right = '20px';
windowCreateButton.style.zIndex = 10000;
windowCreateButton.style.backgroundColor = 'rgb(177, 112, 231)';
windowCreateButton.style.color = 'white';
windowCreateButton.style.border = 'none';
windowCreateButton.style.borderRadius = '50%';
windowCreateButton.style.cursor = 'pointer';
windowCreateButton.style.fontSize = '30px';
windowCreateButton.style.width = '40px';
windowCreateButton.style.height = '40px';
windowCreateButton.style.lineHeight = '40px';

windowCreateButton.addEventListener('click', () => {
    const url = prompt("URL:");
    if (url) {
        createWindow(url);
    }
});

document.body.appendChild(windowCreateButton)