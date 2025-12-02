export const onInstalled = ()=>{
  // TODO: setting default template.
};
export const getCurrentTabId = async () => {
  const  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
}