// content.js - SmartReply Gmail Content Script

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_EMAIL_DATA") {
    try {
      // 1. Scrape the Subject of the email (Gmail uses h2 with class 'hP')
      const subjectEl = document.querySelector('h2.hP');
      const subject = subjectEl ? subjectEl.innerText.trim() : '';

      // 2. Scrape the Sender (Gmail uses span with class 'gD' in email details)
      const senderEl = document.querySelector('span.gD');
      const senderInfo = senderEl ? `${senderEl.innerText} <${senderEl.getAttribute('email') || ''}>` : 'Unknown Sender';

      // 3. Scrape the Email Body (Gmail uses div with class 'a3s' inside the message container)
      const messageContainers = document.querySelectorAll('div.a3s.aiL');
      let emailBody = '';
      if (messageContainers.length > 0) {
        // Grab the last message in the thread as the active email we are replying to
        const activeContainer = messageContainers[messageContainers.length - 1];
        emailBody = activeContainer.innerText.trim();
      }

      sendResponse({
        success: true,
        subject: subject || 'No Subject',
        sender: senderInfo,
        body: emailBody || 'Could not extract email body. Please copy/paste manually.'
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  if (request.action === "INSERT_REPLY") {
    try {
      // Find Gmail's reply/compose textbox (div with role="textbox" and contenteditable="true")
      const composeBox = document.querySelector('div[role="textbox"][contenteditable="true"]');
      
      if (composeBox) {
        composeBox.focus();
        
        // Use insertText command to safely insert text at cursor position, triggering Gmail's internal input listeners
        const success = document.execCommand('insertText', false, request.replyText);
        
        if (success) {
          sendResponse({ success: true });
        } else {
          // Fallback: manually update innerText if execCommand fails
          composeBox.innerText = request.replyText;
          sendResponse({ success: true, fallbackUsed: true });
        }
      } else {
        sendResponse({ 
          success: false, 
          error: "Could not find Gmail compose box. Please open a reply or compose box first." 
        });
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  return true; // Keep message channel open for asynchronous responses
});
