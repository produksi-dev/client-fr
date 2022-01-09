import React from "react";

const Layout = ({ children }) => {
  return (
    <div>
      {children}
      <footer className="bg-light">
        <div className="container py-4 text-center">
          <small>
            &copy;Smarteschool {new Date().getFullYear()}. Hak Cipta Dilindungi
            oleh Undang-undang.
            <br />
            <a
              href="https://smarteschool.id"
              target="_blank"
              rel="noreferrer noopener"
              className="text-decoration-none"
            >
              Powered by Smarteschool.
            </a>
          </small>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
