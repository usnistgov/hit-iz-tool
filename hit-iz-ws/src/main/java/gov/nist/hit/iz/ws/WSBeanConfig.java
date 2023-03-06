/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.hit.iz.ws;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.remoting.jaxws.SimpleJaxWsServiceExporter;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.ws.wsdl.wsdl11.SimpleWsdl11Definition;

import gov.nist.hit.core.service.AccountService;
import gov.nist.hit.core.service.AppInfoService;
import gov.nist.hit.iz.service.IISReceiver;
import gov.nist.hit.iz.service.Receiver;

/**
 * @author Harold Affo (NIST)
 * 
 */

@Configuration
@ImportResource("classpath:/app-ws-context.xml")
public class WSBeanConfig {
	
	@Autowired
	private AppInfoService appInfoService;

	@Bean
	public SimpleJaxWsServiceExporter simpleJaxWsServiceExporter() {
		return new SimpleJaxWsServiceExporter();
	}

	@Bean
	public Receiver receiver() {
		return new IISReceiver();
	}

	@Bean(name = "iisService")
	public DynamicUrlWsdlDefinition wsdl11Definition() {
		DynamicUrlWsdlDefinition s = new DynamicUrlWsdlDefinition();
//		System.out.println("couou "+ appInfoService.get().getUrl());
	    s.setLocation(appInfoService.get().getUrl());
		s.setWsdl(new ClassPathResource("/ws/iisService.wsdl"));
	
	    return s;
	}
}
