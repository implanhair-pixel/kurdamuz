const React = require('react');
function create(createState){
  let state; const listeners = new Set();
  const setState = (partial) => { const next = typeof partial === 'function' ? partial(state) : partial; state = Object.assign({}, state, next); listeners.forEach((l)=>l()); };
  const getState = () => state;
  const api = { setState, getState, subscribe: (listener)=>{listeners.add(listener); return ()=>listeners.delete(listener);} };
  state = createState(setState, getState, api);
  function useStore(selector=(s)=>s){ return React.useSyncExternalStore(api.subscribe, ()=>selector(state), ()=>selector(state)); }
  Object.assign(useStore, api);
  return useStore;
}
module.exports = { create };
