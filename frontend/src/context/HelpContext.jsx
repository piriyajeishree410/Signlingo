import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const HelpContext = createContext();

export function HelpProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = () => setIsOpen(true);
  const closeHelp = () => setIsOpen(false);

  return (
    <HelpContext.Provider value={{ isOpen, openHelp, closeHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

HelpProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useHelp() {
  return useContext(HelpContext);
}
