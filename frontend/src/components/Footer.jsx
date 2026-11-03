import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© Kadai Store · Frontend assessment</p>
        <p>
          Product data:{' '}
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="footer__link"
          >
            dummyjson.com
          </a>
        </p>
      </div>
    </footer>
  )
}
