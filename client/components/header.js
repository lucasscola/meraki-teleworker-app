import Link from 'next/link';
import Router from 'next/router';

const Header = ({ currentUser }) => {
    // Conditionally show Header links
    const links = [
        !currentUser && {label: 'Sign In', href: '/auth/signin'},
        currentUser && {label: 'Sign Out', href: '/auth/signout'}
    ]
    .filter(Boolean)
    .map(({label, href}) => {
        return (
                <Link key={href} href={href}>
                    <a className={`button ${label === 'Sign In' ? 'is-outlined is-primary' : 'is-danger'}`}>{label}</a>
                </Link>
                );   
    });

    return (
        <nav className="navbar is-dark is-fixed-top">
            <div className="navbar-brand is-clickable" onClick={() => Router.push('/')}>
                <span className="navbar-item is-unselectable">Self-service Portal</span>
            </div>
            <div className="navbar-end">
                <div className="navbar-item">
                    {links}
                </div>
            </div>
        </nav>
    );
};

export default Header;