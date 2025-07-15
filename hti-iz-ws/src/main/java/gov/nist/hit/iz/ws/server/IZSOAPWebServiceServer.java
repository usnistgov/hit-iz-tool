package gov.nist.hit.iz.ws.server;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import javax.xml.bind.JAXBException;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.oxm.XmlMappingException;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import gov.nist.hit.core.domain.Transaction;
import gov.nist.hit.core.domain.TransportMessage;
import gov.nist.hit.core.repo.MessageRepository;
import gov.nist.hit.core.service.AccountService;
import gov.nist.hit.core.service.TransactionService;
import gov.nist.hit.core.service.TransportMessageService;
import gov.nist.hit.core.transport.exception.TransportServerException;
import gov.nist.hit.iz.ws.IZWSConstant;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestRequestType;
import gov.nist.hit.iz.ws.jaxb.ConnectivityTestResponseType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageRequestType;
import gov.nist.hit.iz.ws.jaxb.SubmitSingleMessageResponseType;
import gov.nist.hit.iz.ws.utils.HL7MessageUtil;
import gov.nist.hit.iz.ws.utils.WsdlUtil;

@Endpoint
public class IZSOAPWebServiceServer implements TransportServer {

	static final Logger logger = LoggerFactory.getLogger(IZSOAPWebServiceServer.class);

	private static final String NAMESPACE_URI = "urn:cdc:iisb:2011";

	@Autowired
	private AccountService userService;

	@Autowired
	private TransactionService transactionService;

	@Autowired
	private MessageRepository messageRepository;

	@Autowired
	protected TransportMessageService transportMessageService;

	@Override
	@PayloadRoot(namespace = NAMESPACE_URI, localPart = "connectivityTest")
	@ResponsePayload
	public ConnectivityTestResponseType handle(@RequestPayload ConnectivityTestRequestType request) {
		logger.info("connectivityTest request received");
		try {
			ConnectivityTestResponseType response = new ConnectivityTestResponseType();
			response.setReturn(request.getEchoBack());
			return response;
		} catch (Exception e) {
			logger.error("Error handling connectivity test", e);
			throw new TransportServerException("Error handling connectivity test: " + e.getMessage());
		}
	}

	@Override
	@PayloadRoot(namespace = NAMESPACE_URI, localPart = "submitSingleMessage")
	@ResponsePayload
	public SubmitSingleMessageResponseType handle(@RequestPayload SubmitSingleMessageRequestType request) {
		try {
			validateRequest(request);
			String hl7Message = request.getHl7Message();
			if (hl7Message == null || hl7Message.equals("")) {
				throw new TransportServerException("No Hl7 Message Provided");
			}
			Map<String, String> properties = getProperties(request.getUsername(), request.getPassword(),
					request.getFacilityID());
			TransportMessage message = transportMessageService.findOneByProperties(properties);
			if (message != null
					&& IZWSConstant.LISTENER_STARTED.equals(message.getProperties().get(IZWSConstant.LISTENER_STATUS))) {
				String responseMessage = getResponseMessage(message.getMessageId());
				return getSubmitSingleMessageResponse(hl7Message, responseMessage);
			} else {
				throw new TransportServerException("Listener not started");
			}
		} catch (Exception e) {
			logger.error("Error handling submitSingleMessage", e);
			throw new TransportServerException("Error handling message: " + e.getMessage());
		}
	}
	

	public String getResponseMessage(Long messageId) {
		if (messageId != null) {
			return messageRepository.getContentById(messageId);
		}
		return null;
	}

	public String getResponseMessage(String username, String password, String facilityID) {
		Map<String, String> properties = getProperties(username, password, facilityID);
		Long messageId = transportMessageService.findMessageIdByProperties(properties);
		if (messageId != null) {
			return messageRepository.getContentById(messageId);
		}
		return null;
	}

	public Map<String, String> getProperties(String username, String password, String facilityID) {
		Map<String, String> properties = new HashMap<String, String>();
		properties.put("username", username);
		properties.put("password", password);
		properties.put("facilityID", facilityID);
		return properties;
	}

	public Transaction getTransaction(String username, String password, String facilityID) {
		Transaction transaction = transactionService.findOneByProperties(getProperties(username, password, facilityID));
		return transaction;
	}

	private void validateRequest(SubmitSingleMessageRequestType request)
			throws SecurityException, TransportServerException {
		String username = request.getUsername();
		String password = request.getPassword();
		String facilityID = request.getFacilityID();
		Map<String, String> properties = getProperties(username, password, facilityID);
		if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
			throw new SecurityException("Missing Authentication Information");
		} else if (!userService.exitBySutInitiatorPropertiesAndProtocol(properties, "soap")) {
			throw new SecurityException("Invalid Authentication Information");
		}
	}

	private String updateOutboundMessage(String inboundMessage, String outboundMessage) {
		try {
			return HL7MessageUtil.updateOutgoing(outboundMessage, inboundMessage);
		} catch (IOException e) {
			logger.error("Error updating outbound message", e);
			throw new TransportServerException("Error updating outbound message: " + e.getMessage());
		}
	}

	private SubmitSingleMessageResponseType getSubmitSingleMessageResponse(String inboundMessage,
			String outboundMessage) {
		try {
			SubmitSingleMessageResponseType response = null;
			if (outboundMessage != null) {
				inboundMessage = getHL7MessageString(inboundMessage);
				outboundMessage = updateOutboundMessage(inboundMessage, outboundMessage);
				response = new SubmitSingleMessageResponseType();
				response.setReturn(outboundMessage);
			} else {
				try (InputStream inputStream = IZSOAPWebServiceServer.class
						.getResourceAsStream("/ws/messages/SubmitSingleMessageResponse_Precanned.xml")) {
					String outboundSoap = IOUtils.toString(inputStream);
					response = WsdlUtil.toSubmitSingleMessageResponse(outboundSoap);
					outboundMessage = response.getReturn();
					outboundMessage = updateOutboundMessage(inboundMessage, outboundMessage);
					response.setReturn(outboundMessage);
				}
			}
			return response;
		} catch (XmlMappingException | IOException e) {
			logger.error("Error generating outbound message", e);
			throw new TransportServerException("Error generating outbound message: " + e.getMessage());
		} catch (JAXBException e) {
			throw new TransportServerException(
					"ERROR: We were unable to generate the outbound message." + e.getMessage());
		}
	}

	private String getHL7MessageString(String content) {
		return StringEscapeUtils.unescapeXml(
				content.replaceAll(Pattern.quote("<![CDATA["), "").replaceAll(Pattern.quote("]]>"), "").trim());
	}

}
