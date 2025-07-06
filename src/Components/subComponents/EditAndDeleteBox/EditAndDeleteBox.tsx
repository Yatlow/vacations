interface EditAndDeleteBoxProps {
    setState: Function
}

export default function EditAndDeleteBox(props: EditAndDeleteBoxProps) {

    return (
        <div className="editAndDeleteBox">
            <div className="editBox" onClick={() => props.setState((prev:any)=>({...prev, isEditing: true }))}>edit 🖍</div>
            <div className="deleteBox" onClick={() => props.setState((prev:any)=>({...prev, showDeleteModal: true }))}>delete 🗑</div>
        </div >
    )
}