import AnkiStatus from "./AnkiStatus/AnkiStatus";
import DeckInput from "./DeckInput/DeckInput";
import ManualCardAddBtn from "./ManualCardAddBtn/ManualCardAddBtn";
import footerStyles from "./footer.module.css";
const Footer = ({}) => {
  return (
    <footer className={footerStyles.footer}>
      <><DeckInput/><AnkiStatus/><ManualCardAddBtn/></>
    </footer>);
};
export default Footer;