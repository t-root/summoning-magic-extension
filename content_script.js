(() => {
    let clipboardContent = '';
    let hasFetchedClipboard = false;
    document.addEventListener('mousedown', async e => {
      if (e.button === 0 && !hasFetchedClipboard) {
        try {
          clipboardContent = await navigator.clipboard.readText();
          hasFetchedClipboard = true;
          console.log('Clipboard:', clipboardContent);
        } catch {
          console.warn('Không thể đọc clipboard');
        
          // Tạo popup thông báo với nút OK
          const popup = document.createElement('div');
          popup.style.position = 'fixed';
          popup.style.top = '20px';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
          popup.style.padding = '20px';
          popup.style.backgroundColor = '#ff4d4d';
          popup.style.color = '#fff';
          popup.style.fontSize = '16px';
          popup.style.zIndex = '9999';
          popup.style.borderRadius = '8px';
          popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
          popup.style.fontFamily = 'sans-serif';
          popup.style.textAlign = 'center';
        
          popup.innerHTML = `
            <div style="margin-bottom: 10px;">⚠️ Lấy clipboard thất bại. Vui lòng tải lại trang!</div>
            <button id="popup-ok-btn" style="
              padding: 6px 12px;
              background-color: white;
              color: #ff4d4d;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            ">OK</button>
          `;
        
          document.body.appendChild(popup);
        
          document.getElementById('popup-ok-btn').addEventListener('click', () => {
            popup.remove();
          });
        }        
      }
      
    });
  
    // === 2) Helpers drag/resize ===
    let wrapperDiv = null;
    let isDragging = false, isResizing = false;
    let dragOffsetX = 0, dragOffsetY = 0;
  
    function startDrag(e) {
      isDragging = true;
      wrapperDiv.classList.add('dragging');
      dragOffsetX = e.clientX - wrapperDiv.offsetLeft;
      dragOffsetY = e.clientY - wrapperDiv.offsetTop;
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    }
    function doDrag(e) {
      if (!isDragging) return;
      wrapperDiv.style.left = (e.clientX - dragOffsetX) + 'px';
      wrapperDiv.style.top  = (e.clientY - dragOffsetY) + 'px';
    }
    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      wrapperDiv.classList.remove('dragging');
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    }
  
    function startResize(e) {
      isResizing = true;
      wrapperDiv.classList.add('resizing');
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    }
    function doResize(e) {
      if (!isResizing) return;
      const w = Math.max(0, e.clientX - wrapperDiv.offsetLeft);
      const h = Math.max(0, e.clientY - wrapperDiv.offsetTop);
      wrapperDiv.style.width  = w + 'px';
      wrapperDiv.style.height = h + 'px';
    }
    function stopResize() {
      if (!isResizing) return;
      isResizing = false;
      wrapperDiv.classList.remove('resizing');
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    }
  
    // === 3) Tạo wrapper + iframe ===
    function createWrapperAt(x, y) {
      // Xóa cũ nếu có
      if (wrapperDiv) {
        wrapperDiv.remove();
        isDragging = isResizing = false;
      }
      wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'wrapper';
      wrapperDiv.style.width   = '20px';
      wrapperDiv.style.height  = '20px';
      wrapperDiv.style.left    = (x - 10) + 'px';
      wrapperDiv.style.top     = (y - 10) + 'px';
      wrapperDiv.style.display = 'block';
  
      const ifr = document.createElement('iframe');
      ifr.src = clipboardContent || 'about:blank';
      wrapperDiv.appendChild(ifr);
  
      // Mousedown trên wrapper: trái=drag, phải=resize
      wrapperDiv.addEventListener('mousedown', e => {
        e.stopPropagation();
        if (e.button === 0)      startDrag(e);
        else if (e.button === 2) startResize(e);
      });
  
      document.body.appendChild(wrapperDiv);
    }
  
    // === 4) Chỉ dùng contextmenu để tạo/resize và chặn tạo trùng ===
    document.addEventListener('contextmenu', e => {
      // Ngay lập tức ngăn menu và chặn các listener khác
      e.preventDefault();
      e.stopImmediatePropagation();
  
      // Nếu click phải trong wrapper thì resize
      if (wrapperDiv && wrapperDiv.contains(e.target)) {
        startResize(e);
      }
      // Nếu click phải ngoài wrapper thì tạo mới + resize
      else if (hasFetchedClipboard) {
        createWrapperAt(e.clientX, e.clientY);
        startResize(e);
      }
    }, { capture: true });
})();