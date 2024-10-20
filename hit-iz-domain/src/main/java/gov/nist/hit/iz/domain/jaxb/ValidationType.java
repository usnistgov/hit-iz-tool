//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.2.8-b130911.1802 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2017.10.11 at 09:15:39 PM EDT 
//


package gov.nist.hit.iz.domain.jaxb;

import javax.xml.bind.annotation.XmlEnum;
import javax.xml.bind.annotation.XmlEnumValue;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for ValidationType.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * <p>
 * <pre>
 * &lt;simpleType name="ValidationType">
 *   &lt;restriction base="{http://www.w3.org/2001/XMLSchema}string">
 *     &lt;enumeration value="Automated"/>
 *     &lt;enumeration value="Human Inspection"/>
 *   &lt;/restriction>
 * &lt;/simpleType>
 * </pre>
 * 
 */
@XmlType(name = "ValidationType")
@XmlEnum
public enum ValidationType {

    @XmlEnumValue("Automated")
    AUTOMATED("Automated"),
    @XmlEnumValue("Human Inspection")
    HUMAN_INSPECTION("Human Inspection");
    private final String value;

    ValidationType(String v) {
        value = v;
    }

    public String value() {
        return value;
    }

    public static ValidationType fromValue(String v) {
        for (ValidationType c: ValidationType.values()) {
            if (c.value.equals(v)) {
                return c;
            }
        }
        throw new IllegalArgumentException(v);
    }

}
