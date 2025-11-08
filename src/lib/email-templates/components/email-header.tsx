import { Section, Img, Text } from "@react-email/components";
import React from "react";

const logoSvg =
  "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjYzIiB2aWV3Qm94PSIwIDAgNjMgNjMiIHdpZHRoPSI2MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAuMzg0OCA0OS40MDMzVjI1LjE2NDZMNDAuNTQ5NCAxNUw1MC43MTQgMjUuMTY0Nkw1Mi4yNzc4IDI2LjcyODQiIHN0cm9rZT0icmdiKDk0LCAxOTIsIDE2NikiIHN0cm9rZS13aWR0aD0iMTEuMTExMSIvPjxwYXRoIGQ9Ik0xMC4wNTU3IDQ5LjQwMzNWMjUuMTY0NkwyMC4yMjAzIDE1TDMwLjM4NDkgMjUuMTY0NlY0OS40MDMzIiBzdHJva2U9InJnYig5NCwgMTkyLCAxNjYpIiBzdHJva2Utd2lkdGg9IjExLjExMTEiLz48L3N2Zz4=";

const EmailHeader = () => {
  return (
    <Section style={header}>
      <Img src={logoSvg} width="62" height="63" alt="MARBRY INMOBILIARIA Logo" style={logo} />
      <Text style={text}>MARBRY INMOBILIARIA</Text>
    </Section>
  );
};

export default EmailHeader;

const header = {
  padding: "20px 0",
  textAlign: "center" as const,
  backgroundColor: "#ffffff",
};

const logo = {
  margin: "0 auto",
};

const text = {
  fontSize: "24px",
  fontWeight: "bold",
  fontFamily: "'Encode Sans', sans-serif",
  marginTop: "10px",
  color: "#000",
};