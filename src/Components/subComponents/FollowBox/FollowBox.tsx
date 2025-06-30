interface FollowBoxProps{
    toggle: Function;
    tracked:boolean;
    count:number;
};

export default function FollowBox(props:FollowBoxProps) {
    return (
        <div className={props.tracked ? "followBox" : "inactiveFollowBox"}
            onClick={()=>props.toggle()}>
            {props.tracked ? "unfollow ❤" : "follow 🤍"} ({props.count} followers)</div>
    )
}