import config from '../../config/config.json';

export function showPass(setState: Function,err:string) {
    setState((prev:any)=>({...prev,err:err,passInputType:"text"}))
    setTimeout(() => {
        setState((prev:any)=>({...prev,err:err,passInputType:"password"}));
    }, config.uiTimeConfig.showPassMs);
};



