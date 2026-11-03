import { Link } from 'react-router-dom'
import Icon from './Icon'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="container footer__row">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-mark">
              <Icon name="zap" size={16} filled />
            </span>
            VoltNex
          </div>
          <p className="footer__tag">Power Your Play.</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <Link to="/#about" className="footer__link">
            About Us
          </Link>
          <a href="mailto:support@voltnex.gg" className="footer__link">
            Contact Us
          </a>
          <a href="#" className="footer__link">
            Privacy Policy
          </a>
        </nav>

        <div className="footer__social">
          <a href="#" aria-label="YouTube">
            <Icon name="youtube" size={18} />
          </a>
          <a href="#" aria-label="Instagram">
            <Icon name="instagram" size={18} />
          </a>
          <a href="#" aria-label="X">
            <Icon name="twitter" size={18} />
          </a>
          <a href="#" aria-label="Facebook">
            <Icon name="facebook" size={18} />
          </a>
        </div>
      </div>

      <div className="footer__bar">
        <div className="container">
          <p>© 2025 VoltNex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
