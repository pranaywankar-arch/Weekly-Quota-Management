/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * Description : Client script for showing/hiding fields, Validation on 'POS Control Record'
 */
define(['N/record', 'N/currentRecord', 'N/log', 'N/search'], function (record, cr, log, search) {

  function fieldChanged(context) {

    var currentRecord = context.currentRecord;

    log.debug('changes', JSON.stringify(context));

    if (context.fieldId === 'custrecord_jg_quota_employee_type' || context.fieldId === 'custrecord_jg_quota_salesyearstartdate' || context.fieldId === 'custrecord_jg_quota_division') {


      var employeeType = currentRecord.getText({ fieldId: 'custrecord_jg_quota_employee_type' });
      {

        if (employeeType == 'New') {
          var week = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_numbertrgweek' });
          var amt = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentamount' });

          /*var emails = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentemails'});
              var visits = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentfvisit'});
              var calls = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentcall'});
              var prospects = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentprosp'});
              var surveys = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentsurvey'});
              var prosposal = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentpropos'});*/

          week.isVisible = true;
          amt.isVisible = true;

          /*
              emails.isVisible = true;
              visits.isVisible = true;
              calls.isVisible = true;
              prospects.isVisible = true;
              surveys.isVisible = true;
              prosposal.isVisible = true;*/



          var amt1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_amount' });
          var emails1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_number_emails' });
          var visits1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_field_visits' });
          var calls1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_phone_calls' });
          var prospects1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_prospects' });
          var surveys1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_service_surveys' });
          var prosposal1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_proposals' });


          amt1.isDisabled = true;
          emails1.isDisabled = true;
          visits1.isDisabled = true;
          calls1.isDisabled = true;
          prospects1.isDisabled = true;
          surveys1.isDisabled = true;
          prosposal1.isDisabled = true;

          jQuery('.uir-field-group-row .fgroup_title:contains("New Employee Training Period")').show();

          var division = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_division' });
          var year = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_salesyearstartdate' });
          var empType = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_employee_type' });
          if (division && year) {
            if (checkIfPresent()) {
              alert("Control record already present with this Sales Fiscal Year,Divison and Employee Type.");
              currentRecord.setValue({
                fieldId: 'custrecord_jg_quota_employee_type',
                value: '',
                ignoreFieldChange: true
              });
              currentRecord.setValue({
                fieldId: 'custrecord_jg_quota_division',
                value: '',
                ignoreFieldChange: true
              });

            }
            else {
              setFields();

            }

          }

        }
        else {
          var week = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_numbertrgweek' });
          var amt = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentamount' });
          /* var emails = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentemails'});
          var visits = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentfvisit'});
          var calls = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentcall'});
          var prospects = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentprosp'});
          var surveys = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentsurvey'});
          var prosposal = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentpropos'}); */

          week.isVisible = false;
          amt.isVisible = false;
          /*   emails.isVisible = false;
            visits.isVisible = false;
            calls.isVisible = false;
            prospects.isVisible = false;
            surveys.isVisible = false;
            prosposal.isVisible = false; */

          var amt1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_amount' });
          var emails1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_number_emails' });
          var visits1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_field_visits' });
          var calls1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_phone_calls' });
          var prospects1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_prospects' });
          var surveys1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_service_surveys' });
          var prosposal1 = currentRecord.getField({ fieldId: 'custrecord_jg_quota_proposals' });


          amt1.isDisabled = false;
          emails1.isDisabled = false;
          visits1.isDisabled = false;
          calls1.isDisabled = false;
          prospects1.isDisabled = false;
          surveys1.isDisabled = false;
          prosposal1.isDisabled = false;

          jQuery('.uir-field-group-row .fgroup_title:contains("New Employee Training Period")').hide();


          var division = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_division' });
          var year = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_salesyearstartdate' });
          var empType = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_employee_type' });

          if (division && year && empType) {
            if (checkIfPresent()) {
              alert("Control record already present with this Sales Fiscal Year,Divison and Employee Type.");
              currentRecord.setValue({
                fieldId: 'custrecord_jg_quota_employee_type',
                value: '',
                ignoreFieldChange: true
              });
              currentRecord.setValue({
                fieldId: 'custrecord_jg_quota_division',
                value: '',
                ignoreFieldChange: true
              });

            }
          }

        }

      }

    }


  }


  //Function to check if POS control record is already present with same division,year,employee type.
  function checkIfPresent() {

    var currentRecord = cr.get();

    var division = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_division' });
    var year = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_salesyearstartdate' });
    var empType = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_employee_type' });

    var customrecord_jg_quota_control_recordSearchObj = search.create({
      type: "customrecord_jg_quota_control_record",
      filters:
        [
          ["custrecord_jg_quota_division", "anyof", division],
          "AND",
          ["custrecord_jg_quota_salesyearstartdate", "anyof", year],
          "AND",

          ["custrecord_jg_quota_employee_type", "anyof", empType]
        ],
      columns:
        [
          search.createColumn({ name: "internalid", label: "Internal ID" }),
          search.createColumn({ name: "custrecord_jg_quota_number_emails", label: "# of Emails" }),
          search.createColumn({ name: "custrecord_jg_quota_field_visits", label: "# of Field Visits" }),
          search.createColumn({ name: "custrecord_jg_quota_phone_calls", label: "# of Phone Calls" }),
          search.createColumn({ name: "custrecord_jg_quota_proposals", label: "# of Proposals" }),
          search.createColumn({ name: "custrecord_jg_quota_prospects", label: "# of Prospects" }),
          search.createColumn({ name: "custrecord_jg_quota_service_surveys", label: "# of Service Surveys" }),
          search.createColumn({ name: "custrecord_jg_quota_amount", label: "Amount" })
        ]
    });
    var searchResultCount = customrecord_jg_quota_control_recordSearchObj.runPaged().count;
    log.debug("customrecord_jg_quota_control_recordSearchObj result count", searchResultCount);

    if (searchResultCount > 0) {
      return true;
    }
    else {
      return false;
    }

  }

// Function to set fields for new Employee type.
  function setFields() {
    var currentRecord = cr.get();

    var division = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_division' });
    var year = currentRecord.getValue({ fieldId: 'custrecord_jg_quota_salesyearstartdate' });

    var customrecord_jg_quota_control_recordSearchObj = search.create({
      type: "customrecord_jg_quota_control_record",
      filters:
        [
          ["custrecord_jg_quota_division", "anyof", division],
          "AND",
          ["custrecord_jg_quota_salesyearstartdate", "anyof", year],
          "AND",

          ["custrecord_jg_quota_employee_type", "anyof", "2"]
        ],
      columns:
        [
          search.createColumn({ name: "internalid", label: "Internal ID" }),
          search.createColumn({ name: "custrecord_jg_quota_number_emails", label: "# of Emails" }),
          search.createColumn({ name: "custrecord_jg_quota_field_visits", label: "# of Field Visits" }),
          search.createColumn({ name: "custrecord_jg_quota_phone_calls", label: "# of Phone Calls" }),
          search.createColumn({ name: "custrecord_jg_quota_proposals", label: "# of Proposals" }),
          search.createColumn({ name: "custrecord_jg_quota_prospects", label: "# of Prospects" }),
          search.createColumn({ name: "custrecord_jg_quota_service_surveys", label: "# of Service Surveys" }),
          search.createColumn({ name: "custrecord_jg_quota_amount", label: "Amount" })
        ]
    });
    var searchResultCount = customrecord_jg_quota_control_recordSearchObj.runPaged().count;
    log.debug("customrecord_jg_quota_control_recordSearchObj result count", searchResultCount);

    if (searchResultCount > 0) {
      customrecord_jg_quota_control_recordSearchObj.run().each(function (result) {
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_amount', value: result.getValue({ name: "custrecord_jg_quota_amount" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_number_emails', value: result.getValue({ name: "custrecord_jg_quota_number_emails" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_field_visits', value: result.getValue({ name: "custrecord_jg_quota_field_visits" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_phone_calls', value: result.getValue({ name: "custrecord_jg_quota_phone_calls" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_prospects', value: result.getValue({ name: "custrecord_jg_quota_prospects" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_service_surveys', value: result.getValue({ name: "custrecord_jg_quota_service_surveys" }) });
        currentRecord.setValue({ fieldId: 'custrecord_jg_quota_proposals', value: result.getValue({ name: "custrecord_jg_quota_proposals" }) });
        return false;
      });
    }
    else {

      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_amount', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_number_emails', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_field_visits', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_phone_calls', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_prospects', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_service_surveys', value: '' });
      currentRecord.setValue({ fieldId: 'custrecord_jg_quota_proposals', value: '' });

      if (year && division) {
        alert("There is no existing 'POS Control record' for this 'Division' and 'Sales Fiscal Year' for 'Existing Employee' type. Please create it first before saving this record.");
        currentRecord.setValue({
          fieldId: 'custrecord_jg_quota_employee_type',
          value: '',
          ignoreFieldChange: true
        });
      }

    }
  }


  // On Page load hide 'New employee fields'
  function pageInit(context) {
    var currentRecord = context.currentRecord;
    var week = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_numbertrgweek' });
    var amt = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentamount' });


    /*  var emails = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentemails'});
     var visits = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentfvisit'});
     var calls = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentcall'});
     var prospects = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentprosp'});
     var surveys = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentsurvey'});
     var prosposal = currentRecord.getField({ fieldId: 'custrecord_jg_quotacontrol_percentpropos'}); */

    week.isVisible = false;
    amt.isVisible = false;
    /*  emails.isVisible = false;
     visits.isVisible = false;
     calls.isVisible = false;
     prospects.isVisible = false;
     surveys.isVisible = false;
     prosposal.isVisible = false; */

    jQuery('.uir-field-group-row .fgroup_title:contains("New Employee Training Period")').hide();

  }




  return {
    fieldChanged: fieldChanged,
    pageInit: pageInit
  };
});
