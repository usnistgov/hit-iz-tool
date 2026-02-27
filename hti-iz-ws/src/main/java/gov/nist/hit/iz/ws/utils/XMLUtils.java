package gov.nist.hit.iz.ws.utils;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.xpath.XPathFactory;

public class XMLUtils {
    private static final DocumentBuilderFactory documentBuilderFactory;
    private static final TransformerFactory transformerFactory;
    private static final XPathFactory xPathFactory;

    static {
        documentBuilderFactory = DocumentBuilderFactory.newInstance();
		transformerFactory = TransformerFactory.newInstance();
		xPathFactory = XPathFactory.newInstance();
    }

    public static DocumentBuilderFactory getDocumentBuilderFactory() {
        return documentBuilderFactory;
    }

    public static TransformerFactory getTransformerFactory() {
        return transformerFactory;
    }

    public static XPathFactory getXPathFactory() {
        return xPathFactory;
    }
}
