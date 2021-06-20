import Link from 'next/link';
import Image from 'next/image';

const Tile = ({title, text, buttonText, buttonHref, imageSrc, imageAlt, childComponent}) => {
    return (
        <div className="tile is-child card is-flex is-flex-direction-column">
            <div className="card-image">
                <figure className="image is-3by1">
                    <Image
                        src={ imageSrc }
                        alt={ imageAlt }
                        layout="fill"
                    />
                </figure>
            </div>
            <div className="card-content is-flex-grow-1">
                <h1 className="title is-4">{ title }</h1>
                <div className="content">
                    <p className="content">{ text }</p>
                    {childComponent}
                </div>
            </div>
            <div className="card-footer">
                <Link href={buttonHref}>
                    <a className="card-footer-item">{ buttonText } <span className="icon"><i className="fas fa-arrow-right"></i></span></a>
                </Link>
            </div>
        </div>
    );
};

export default Tile;