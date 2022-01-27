package gov.nist.hit.iz.ws;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Source;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.sax.SAXSource;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;
import org.springframework.ws.wsdl.wsdl11.SimpleWsdl11Definition;
import org.springframework.ws.wsdl.wsdl11.Wsdl11Definition;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

public class DynamicUrlWsdlDefinition implements Wsdl11Definition, InitializingBean {

  private static final String SOAP_ADDRESS_LOCATION_XPATH_EXPRESSION = "/definitions/service/port/address/@location";
 
  private String location;

  private SimpleWsdl11Definition delegate;

  public DynamicUrlWsdlDefinition() {
    this.setDelegate(new SimpleWsdl11Definition());
  }

  @Override
  public Source getSource() {
    try {
      final DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
      final DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
      final Document document = documentBuilder.parse(((SAXSource) this.getDelegate().getSource()).getInputSource());

      final XPath xPath = XPathFactory.newInstance().newXPath();
      final Node locationAttributeNode = (Node) xPath.compile(SOAP_ADDRESS_LOCATION_XPATH_EXPRESSION).evaluate(document, XPathConstants.NODE);
      if(StringUtils.hasText(location)) {
          locationAttributeNode.setTextContent( this.getLocation()+"/ws/iisService");
      }

      return new DOMSource(document);
    } catch (Exception e) {
      return this.getDelegate().getSource();
    }
  }

  private String getLocation() {
    return location;
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    this.getDelegate().afterPropertiesSet();
  }

  public void setWsdl(final Resource wsdlResource) {
    this.getDelegate().setWsdl(wsdlResource);
  }

  private SimpleWsdl11Definition getDelegate() {
    return delegate;
  }

  private void setDelegate(final SimpleWsdl11Definition delegate) {
    this.delegate = delegate;
  }

  public void setLocation(final String wsEnvironment) {
    this.location = wsEnvironment;
  }

}