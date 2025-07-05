import loading from '../../../assets/images/loading.png'

export default function LoadingBox() {

    return (
        <div className="loadingModal">
            <img src={loading} className="loadingImg" />
            <a>loading...</a>
        </div >
    )
}