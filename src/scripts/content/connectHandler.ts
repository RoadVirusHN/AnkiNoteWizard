
export const connectHandler = (port: chrome.runtime.Port) => {
  switch (port.name) {
    case "ENTER_INSPECTION_MODE_FROM_PANEL":
      
      port.postMessage({type: "ENTER_INSPECTION_MODE_FROM_CONTENT"});
      break;
    case "EXIT_INSPECTION_MODE_FROM_PANEL":
      
      port.postMessage({type: "EXIT_INSPECTION_MODE_FROM_CONTENT"});
      break;

  }  
};