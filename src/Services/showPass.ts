import config from '../../config/config.json';

export function showPass(setState: Function,err:string) {
    setState({err:err,passInputType:"text"});
    setTimeout(() => {
        setState({err:err,passInputType:"password"})
    }, config.uiTimeConfig.showPassMs);
};



