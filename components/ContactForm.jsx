"use client";

export default function ContactForm() {
  return (
    <div className="odoo-form-wrapper">
      <iframe
        src="https://jade-demo-app.odoo.com/contact-us?utm_source=external_website&utm_medium=website&utm_campaign=portfolio_linked_contact"
        title="Odoo Contact Form"
        className="odoo-form"
      />

      <style jsx>{`
        .odoo-form-wrapper {
          width: 100%;
          height: 500px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--hairline);
        }

        .odoo-form {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        @media (max-width: 720px) {
          .odoo-form-wrapper {
            height: 800px;
          }
        }
      `}</style>
    </div>
  );
}