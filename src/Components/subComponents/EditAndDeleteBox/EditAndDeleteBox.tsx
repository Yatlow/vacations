import type { JSX } from "react";

interface EditAndDeleteBoxProps {
    tracked: boolean;
    followerCount: number;
    image: JSX.Element | null;
    isEditing: boolean;
    showDeleteModal: boolean;
    mounter: boolean;
    setState: Function
}


export default function EditAndDeleteBox(props: EditAndDeleteBoxProps) {
    const state = {
        tracked: props.tracked,
        followerCount: props.followerCount,
        image: props.image,
        isEditing: props.isEditing,
        showDeleteModal: props.showDeleteModal,
        mounter: props.mounter
    }
    return (
        <div className="editAndDeleteBox">
            <div className="editBox" onClick={() => props.setState({...state, isEditing: true })}>edit 🖍</div>
            <div className="deleteBox" onClick={() => props.setState({ ...state, showDeleteModal: true })}>delete 🗑</div>
        </div >
    )
}