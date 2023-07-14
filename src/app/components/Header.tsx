import React from "react";

const Header: React.FC = () => {
  return (
    <>
      <h1>
        <b> Sismo Connect Starter: offchain app with Next.js</b>
      </h1>
      <h3>
        <a href="https://docs.sismo.io"> Read the docs | </a>
        <a href="https://builders.sismo.io"> Join the Telegram Builders Group </a>
      </h3>
      <p>
        1. The frontend requests ZK Proofs via Sismo Connect Button <br />
        2. The user generates ZK Proofs in their Data Vault and sends the Sismo Connect response to
        the frontend <br />
        3. The frontend forwards the response to the backend via the verify API route <br />
        4. The backend verifies the proofs contained in the response and sends the result back to
        the frontend <br />
        5. The frontend displays the Sismo Connect requests and verified result
      </p>
      <div>
        <p>
          <b className="code-snippet">src/app/sismo-connect-config.ts</b>: Sismo Connect
          configuration and requests
        </p>
        <p>
          <b className="code-snippet">src/app/page.tsx</b>: Frontend - make Sismo Connect request
        </p>
        <p>
          <b className="code-snippet">src/api/verify/route.ts</b>: Backend - verify Sismo Connect
          request
        </p>
      </div>
    </>
  );
};

export default Header;
