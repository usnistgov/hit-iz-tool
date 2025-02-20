package gov.nist.hit.iz.service;

import org.json.JSONObject;

import gov.nist.healthcare.unified.expressions.Action;
import gov.nist.healthcare.unified.expressions.Exp;
import gov.nist.healthcare.unified.filter.Condition;
import gov.nist.healthcare.unified.filter.Filter;
import gov.nist.healthcare.unified.filter.Restriction;
import gov.nist.healthcare.unified.model.EnhancedReport;
import gov.nist.hit.core.domain.MessageValidationCommand;
import gov.nist.hit.core.domain.MessageValidationResult;
import gov.nist.hit.core.domain.TestContext;
import gov.nist.hit.core.hl7v2.service.HL7V2MessageValidator;
import gov.nist.hit.core.service.exception.MessageValidationException;

public class IZHL7V2MessageValidatorImpl extends HL7V2MessageValidator {

	@Override
	public MessageValidationResult validate(TestContext testContext, MessageValidationCommand command)
			throws MessageValidationException {
		try {
			EnhancedReport report = super.generateReport(testContext, command);
			if (report != null) {
				
				//no longer support dqacondes (data quality analysis)
//				if (command.getDqaCodes() != null && !command.getDqaCodes().isEmpty()) {
//					// Perform a DQA validation
//					CompactReportModel dqaResults = ProcessMessageHL7.getInstance().process(command.getContent(),
//							command.getFacilityId());
//					report.put(dqaResults.toSections(command.getDqaCodes()));
//				}
				// Create a restriction
				Restriction restriction = new Restriction();
				restriction.add(new Condition("path", Exp.Format, "RXA\\[[1-9]+[0-9]*\\]-9\\[2\\](\\.[1-9]+[0-9]*)*"));
				restriction.setAction(Action.Remove);
				// Create a filter
				Filter f = new Filter();
				// Add restriction to filter
				f.restrain(restriction);
				// Filter report
				report = f.filter(report);

				JSONObject config = new JSONObject();
				config.put("excluded", "affirmative");
				return new MessageValidationResult(report.to("json").toString(), report.render("report", config));
			}
			throw new MessageValidationException(); // TODO: FIXME
		} catch (RuntimeException e) {
			throw new MessageValidationException(e.getLocalizedMessage());
		} catch (Exception e) {
			throw new MessageValidationException(e.getLocalizedMessage());
		}
	}

}
