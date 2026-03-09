/**

* @NApiVersion 2.1

* @NScriptType Suitelet

*/
define(['N/ui/serverWidget', 'N/search', 'N/render', 'N/record', 'N/xml', 'N/file','N/runtime','N/format'], (serverWidget, search, render, record, xml, file,runtime,format) => {

    const onRequest = (scriptContext) => {

        if (scriptContext.request.method === 'GET') {

            let form = serverWidget.createForm({
                title: 'Weekly Performance Measurement Report'
            });
           // form.clientScriptFileId= 94985;
          form.clientScriptModulePath = 'SuiteScripts/pos_CS_Generatereport_New.js'
            
            var currentUser = runtime.getCurrentUser().id;
            //log.debug('currentUser',currentUser);
            var fieldLookUp = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: currentUser,
                columns: ['entityid']
            });
            
			var searchLoad = search.load({
				id : 'customsearch_all_emp_access',
				type : 'role'
			});
			 var rolesId = [];
			searchLoad.run().each(function(res){
				rolesId.push(Number(res.id));
				return true;
			});
			
			log.debug('rolesId',rolesId)
			var currentRole = Number(runtime.getCurrentUser().role);
			
            var currentUserEmpId = fieldLookUp.entityid;
            //log.debug('currentUserEmpId',currentUserEmpId);
            //add current user to the list of field of SALES REP
			 
			if(rolesId.indexOf(currentRole) >= 0){
				let field = form.addField({
                id: 'custpage_salesrepfield',
                type: serverWidget.FieldType.SELECT,
                label: 'SALES REP',
				//source : 'employee'

            });
             var employeeSearchObj = search.load({
                 id : 'customsearch_wpm_sales_reps'
             });
             var searchResultCount = employeeSearchObj.runPaged().count;
             //log.debug("employeeSearchObj result count",searchResultCount);
             var internalId, supervisorName;
             employeeSearchObj.run().each(function (result) {
                var internalId = result.getValue({
                    name: 'custrecord_rep_name',
					summary : 'GROUP'
                });
               
                
                //log.debug('internalId', internalId);
                var entityId=result.getText({
                    name: 'custrecord_rep_name',
					summary : 'GROUP'
                });
                
                //log.debug('entityId', entityId);
                //adding subordinates to the list of field SALES REP
               field.addSelectOption({
                    value: internalId,
                    text: entityId,
                    });
                  /*field.addSelectOption({
                    value: 2075953,
                    text: 'Test WPM',
                    });  */
                return true;
                
            });
            field.isMandatory = true; 
			field.defaultValue = runtime.getCurrentUser().id;
			
			}else{
				let field = form.addField({
                id: 'custpage_salesrepfield',
                type: serverWidget.FieldType.SELECT,
                label: 'SALES REP',

            });
            
            field.isMandatory = true;
				field.addSelectOption({
                value: currentUser,
                text: currentUserEmpId,
                });
            
            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                [
                   ["supervisor","anyof", currentUser]
                ],
                columns:
                [
                   search.createColumn({name: "internalid", label: "Internal ID"}),
                   search.createColumn({
                      name: "entityid",
                      sort: search.Sort.ASC,
                      label: "Name"
                   })
                ]
             });
             var searchResultCount = employeeSearchObj.runPaged().count;
             //log.debug("employeeSearchObj result count",searchResultCount);
             var internalId, supervisorName;
             employeeSearchObj.run().each(function (result) {
                var internalId = result.getValue({
                    name: 'internalid'
                });
               
                
                //log.debug('internalId', internalId);
                var entityId=result.getValue({
                    name: 'entityid'
                });
                
                //log.debug('entityId', entityId);
                //adding subordinates to the list of field SALES REP
                field.addSelectOption({
                    value: internalId,
                    text: entityId,
                    });
                /*field.addSelectOption({
                    value: 2075953,
                    text: 'Test WPM',
                    }); */     

                return true;
                
            });
			}
            
			
			form.addField({
                id: 'custpage_startdate_entry',
                type: serverWidget.FieldType.DATE,
                label: 'Start Date Of Week',
              
            })
			
			/**
			 form.addField({
                id: 'custpage_salesterr',
                type: serverWidget.FieldType.SELECT,
                label: 'Sales Territory',
                source: 'customlist_pos_sales_territory_list'
            })
			
			   form.addField({
                id: 'custpage_plantfield',
                type: serverWidget.FieldType.SELECT,
                label: 'PLANT',
                source: 'customrecord_jg_experian_apisubcodes'
            })

            **/

            form.addField({
                id: 'custpage_salesweekfield',
                type: serverWidget.FieldType.SELECT,
                label: 'WEEK',
                 source: 'customrecord_jg_quota_sales_weeks'
            });

        var weekNoObj = form.addField({
                id: 'custpage_week_no',
                type: serverWidget.FieldType.SELECT,
                label: 'WEEK Number',
                 source: 'customlistjg_quota_sales_week_number'
            });
			


          weekNoObj.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.DISABLED
			});

         


            form.addField({
                id: 'custpage_yearfield1',
                type: serverWidget.FieldType.TEXT,
                label: 'YEAR',
                source: 'customrecord_jg_sales_fiscal_year'
            });

           
			
			
			var sObj = form.addField({
                id: 'custpage_startdate',
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
              
            })
			
			sObj.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.DISABLED
			});
			
			
			var endDObj =  form.addField({
                id: 'custpage_enddate',
                type: serverWidget.FieldType.DATE,
                label: 'End Date',
                
            });
			
			
		
			
		
			
			
			
			/**
			form.addField({
                id: 'custpage_previosweek',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Previous Week',
                
            });
			**/
			
			form.addField({
                id: 'custpage_salesterr_text',
                type: serverWidget.FieldType.TEXT,
                label: 'End Date',
                
            }).updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
			});
			
			endDObj.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.DISABLED
			});
           


            form.addSubmitButton({
                label: 'Submit Button'
            });

            scriptContext.response.writePage(form);

        } else {
            log.debug("post action", scriptContext.request);
            var salesTerr = scriptContext.request.parameters.custpage_salesterr_text;
            log.debug('salesTerr action', salesTerr);
            var empName = scriptContext.request.parameters.custpage_salesrepfield_display;
            log.debug('Employee name', empName);
            var salesrepId = scriptContext.request.parameters.custpage_salesrepfield;
            log.debug('employee id', salesrepId);

            const SalesRepField = scriptContext.request.parameters.custpage_salesrepfield;
              const WeekField = scriptContext.request.parameters.custpage_week_no;
			  var weekWithNo = scriptContext.request.parameters.custpage_salesweekfield_display;
			  log.debug('week with no',weekWithNo)
            const PlantField = scriptContext.request.parameters.custpage_plantfield;
            const YearField = scriptContext.request.parameters.custpage_yearfield1;
            const SalesTerrField = scriptContext.request.parameters.custpage_salesterr;
            var weekStartDate = scriptContext.request.parameters.custpage_startdate;
           var weekEndDate = scriptContext.request.parameters.custpage_enddate;
		   log.emergency('week start date',weekStartDate)
          
		   
		   var recordId =  getWpmReport(SalesRepField,weekStartDate,weekEndDate)
            var renderer = render.create();
			/**
            var xmlTemplateFile = file.load({
                id: 'SuiteScripts/pdf_generate_report_template.txt'
            });

            //log.debug('xml content',xmlTemplateFile.getContents());
               //renderer.templateContent = xmlTemplateFile.getContents();
			   **/

        renderer.setTemplateByScriptId({
                  scriptId: "CUSTTMPL_WPM_REPORT"
              });
			  
			   renderer.addRecord('record', record.load({
                type: 'customrecord_wpm_report',
                id: recordId
            }));

            var xmlStr = renderer.renderAsString()
            //var newfile=renderer.renderAsPdf();
            //  log.debug('xml', xmlStr);
            //
			log.debug('final xml string',xmlStr);
            scriptContext.response.renderPdf(xmlStr);

        }
	}
		
		
		
		function getWpmReport(salesRep,startDate,endDate){
			var recordId = 0;
			   var customrecord_wpm_reportSearchObj = search.create({
   type: "customrecord_wpm_report",
   filters:
   [
      ["custrecord_wpm_sales_rep","anyof",salesRep], 
      "AND", 
      ["custrecord_wpm_week_sd","onorafter",startDate], 
      "AND", 
      ["custrecord_wpm_week_ed","onorbefore",endDate]
   ],
   
});
var searchResultCount = customrecord_wpm_reportSearchObj.runPaged().count;
log.debug("customrecord_wpm_reportSearchObj result count",searchResultCount);
customrecord_wpm_reportSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
   recordId = result.id;
   return true;
});


     if(recordId == 0){
		  var recObj = record.create({
			   type : 'customrecord_wpm_report'
		  });
		  
		  
		   var wStartDate = format.parse({
            value: startDate,
            type: format.Type.DATE
        });
		
		 var wendDate = format.parse({
            value: endDate,
            type: format.Type.DATE
        });
		  recObj.setValue('custrecord_wpm_sales_rep',salesRep);
		  recObj.setValue('custrecord_wpm_week_sd',wStartDate);
		  recObj.setValue('custrecord_wpm_week_ed',wendDate);
		   try{
			    recordId =  recObj.save();
		   }catch(e){
			   throw e;
		   }
		
	 }else{
		   var recObj = record.load({
			   type : 'customrecord_wpm_report',
			   id : recordId
		  });
		  recObj.save();
	 } 
   return recordId;
			
		}

       


    return {
        onRequest: onRequest
    };

});