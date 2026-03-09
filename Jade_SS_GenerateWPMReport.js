/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/render', 'N/record', 'N/search', 'N/xml','N/runtime','N/format'],
    /**
     * @param{render} render
     */
    (render, record, search, xmlObj,runtime,format) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
			
			  var reqId = runtime.getCurrentScript().getParameter('custscript_wpm_req_id')

            /**
                       var urls = ["/core/media/media.nl?id=23154&c=953134_SB2&h=Y_olfbk7MknSAOmljLP7HIHn9wPuJ9Hc8SnUxnjQPoPrGYfX&_xt=.pdf","/core/media/media.nl?id=23155&c=953134_SB2&h=F3sdsOaIOX-4GQu-InclX7DwwHdAI4h3JxvExL6gLVT7eDmx&_xt=.pdf","/core/media/media.nl?id=23156&c=953134_SB2&h=b8tm4C5bMhpFxvYvJypx9IGl6at1zSoWDwt_6QIuN64X8R6D&_xt=.pdf","/core/media/media.nl?id=23157&c=953134_SB2&h=j6rP4iXADTI1bZNfjJbDRPlvn-y4gEs5VfzzSxLsuVBb2s-K&_xt=.pdf","/core/media/media.nl?id=23158&c=953134_SB2&h=f7MyA4vDXeWotxW_Br4kzYeN_Pf4LbtWjdEEsSnJCt-MX244&_xt=.pdf","/core/media/media.nl?id=23159&c=953134_SB2&h=z1WMhuPniXcTScu2seXhWsNJ0iWZPKl1MfaQI475w059tlmD&_xt=.pdf","/core/media/media.nl?id=23160&c=953134_SB2&h=OgjAu2l1A10k-0MvyTVumiUu6EPDcVkm1FIXEswVyJa7hAys&_xt=.pdf","/core/media/media.nl?id=23161&c=953134_SB2&h=1X0nHmcfRKuA3py2J0nSPSQQAA2quRkFbEAkjbmNZdaZ0jKm&_xt=.pdf","/core/media/media.nl?id=23162&c=953134_SB2&h=-RncPpiIbGaiagCRl-oMyG65CGN-ZJxH1GaM6_X_dg0DtabM&_xt=.pdf","/core/media/media.nl?id=23163&c=953134_SB2&h=M2XHAjVDozDTlpeuUXLPIitddNi-AU4R1yby_G7ASqmE9Gh6&_xt=.pdf","/core/media/media.nl?id=23164&c=953134_SB2&h=ofJRMmATCvYB9b3PuAKJv6jv0AUYIxfFzVwyYVbCJXQS1BLe&_xt=.pdf","/core/media/media.nl?id=23165&c=953134_SB2&h=r-GiSooHrbgyR9gyCurm5jBFwUwvqItLsTNXfi2fVqDHReFA&_xt=.pdf","/core/media/media.nl?id=23166&c=953134_SB2&h=_eGs8VREv9kReZdmwgSeURjIFwx5Au9PrLmWn8xAo8JKYkGY&_xt=.pdf","/core/media/media.nl?id=23167&c=953134_SB2&h=adG09Xy9-IrDp39J1rsGAeM4NYSiduQrCPX5rvFhpcY6wzvt&_xt=.pdf","/core/media/media.nl?id=23168&c=953134_SB2&h=6JNT0kjvnrR70tdZQ9JY7WSE_YMQfar83-cgCcS4PF0hQ4EP&_xt=.pdf","/core/media/media.nl?id=23169&c=953134_SB2&h=SQoVNe3yvKcforbkRin4MB6dhvu_T9gY-JCBcehQoFy88F5N&_xt=.pdf","/core/media/media.nl?id=23170&c=953134_SB2&h=GVkImIBd6iIeQYXE1ptUdSdiWG0aPcLwFt-5fK0nfLng6Pcf&_xt=.pdf","/core/media/media.nl?id=23171&c=953134_SB2&h=kRwO2a0X-m9Dw-iJhj58j0fZiXgzbSoOtNidNjpvV-DDFPhf&_xt=.pdf","/core/media/media.nl?id=23172&c=953134_SB2&h=hyNyQUFrr_kLcnlssTNyuTPrI8QI_Y_TzryEm86ZHQl6WfMl&_xt=.pdf","/core/media/media.nl?id=23173&c=953134_SB2&h=PpNjFfLMdk2bqsSaDPkfdphRqTYkV-oXZ3OliQQY4BH10TaJ&_xt=.pdf","/core/media/media.nl?id=23174&c=953134_SB2&h=hMouMesdTwnqhwd_ta6j1DGi-H3io5On-hAe42SM8x_8WJEk&_xt=.pdf","/core/media/media.nl?id=23175&c=953134_SB2&h=Yq2HQaI8isigUM7tTHccyubXmCTpMFVSDpL0NRF9GmmLx-16&_xt=.pdf","/core/media/media.nl?id=23176&c=953134_SB2&h=Wq4XucxzO7UnTEM3WOASGqjo8COG2sQkEZtYYQJTwp02Y5iy&_xt=.pdf","/core/media/media.nl?id=23177&c=953134_SB2&h=i4EJUTFzk-Eh-SUc9_lQ7MiIRbxlYCXpdwPGSR1R2KzfZHSB&_xt=.pdf","/core/media/media.nl?id=23178&c=953134_SB2&h=t6c4ivXPXYH31GLBAzQ89iUXox0Wx7-Chi5HTLcEQZlsSCHY&_xt=.pdf","/core/media/media.nl?id=23179&c=953134_SB2&h=jC4Dp6bvpvwUdAd-t8syjfVQLpguJCdhKMo89k3R94N8u4Hw&_xt=.pdf","/core/media/media.nl?id=23180&c=953134_SB2&h=iWeaL1rPUlmZZmYw1M2JSSWI3LwdJ43ynpjQltFZD0sqOdlU&_xt=.pdf","/core/media/media.nl?id=23181&c=953134_SB2&h=o8j8-HY35z9KEJgaAK0LyZG2XRhmr_fSmVOpTvu-dk9vDX9i&_xt=.pdf","/core/media/media.nl?id=23182&c=953134_SB2&h=bPjkWgFg7-NAsd2B1Hs0hj-LGnndOWG31VNjKRmGXn9zHkNx&_xt=.pdf","/core/media/media.nl?id=23183&c=953134_SB2&h=fOaX-_tShIa9qrzmwIgODMw_W4a4g7TWawvDnbSgPdx3RBIz&_xt=.pdf","/core/media/media.nl?id=23184&c=953134_SB2&h=dz28rCyCbUrnoCzUmkZfgKZ2JTkxaIXAj5wnS31ix0aHgFJx&_xt=.pdf","/core/media/media.nl?id=23185&c=953134_SB2&h=tROgF0tIz1vEwcmsvWH83YkbdbkwuqhJWjfYzS1hZmpfQP80&_xt=.pdf","/core/media/media.nl?id=23186&c=953134_SB2&h=9v7UqX6krrUe-gu02JOjYn5IGBEOiYsAy0svq6YT4HoZQ8Rg&_xt=.pdf","/core/media/media.nl?id=23187&c=953134_SB2&h=2AfhQuarYO5NdZapf_5hNjn9R5boRYzfkcPXFtWgHfAbXmDg&_xt=.pdf","/core/media/media.nl?id=23188&c=953134_SB2&h=ENAZl4h8kCW5bQP2qSSEgpvyh2xZO_c3EFhG7FwJdip0NOav&_xt=.pdf","/core/media/media.nl?id=23189&c=953134_SB2&h=q4CCtVs_qK7_NkvRGsugVU63aI9vf0ue3vE5E6dI9LMPepar&_xt=.pdf","/core/media/media.nl?id=23190&c=953134_SB2&h=XPIOjG-wjsYOyG9VCoLwSfZ_cN9kNAkPH9HFaWBTh4R9WcH8&_xt=.pdf"]
                       var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
              xml += "<pdfset>";

                  
                      urls.forEach(function(res){
                            
                               xml += "<pdf src='"+ xmlObj.escape(res) +"'/>";
                              
                                 
                            
                      });

                      xml += "</pdfset>"

                      var pdfFile = render.xmlToPdf({
            	xmlString: xml
            });

                        pdfFile.folder = 120863
                       pdfFile.name ="WPM_REPORT_"+new Date()
                       var pdfFileId = pdfFile.save();
                       log.debug('pdfFileId',pdfFileId);

                      return;

                      **/
					  
			  var currentDate = new Date();
			
                 currentDate.setDate(currentDate.getDate() - 2);
                var startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - currentDate.getDay());
                var endDate = new Date(currentDate);
                
                endDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
				log.debug('Week Start and End Date', startDate + '@@@@' + endDate);
			//  return;
				if(!reqId){
					var recObj = record.create({
						type : 'customrecord_wpm_report_request'
					})
					recObj.setValue('custrecord_wpm_week_start_date', startDate)
					recObj.setValue('custrecord_wpm_week_endate', endDate)		  
					reqId = recObj.save();
					log.debug('record id created',reqId)
				}
				
                  

            var fileNames = [];

            var searchObj = search.load({
                id: 'customsearch6542'
            })
         

        
          var wpmReq = record.load({
                    type: 'customrecord_wpm_report_request',
                    id: reqId
                });
          var supervisor = wpmReq.getValue('custrecord_wpm_supervisor');
           var allSubordinates = [];
          if(supervisor){
              allSubordinates = getAllSubordinates(supervisor)
          }
         
             log.debug('allSubordinates',allSubordinates);
              var plant =   wpmReq.getValue('custrecord_wpm_plant');
            var filters = [];
              if(plant){
                  filters.push(search.createFilter({
                    name: 'location',
                    join : 'custrecord_rep_name',
                    operator: search.Operator.ANYOF,
                    values: plant
                }));
              }

              if(allSubordinates.length > 0){

                       filters.push(search.createFilter({
                    name: 'internalid',
                    join : 'custrecord_rep_name',
                    operator: search.Operator.ANYOF,
                    values: allSubordinates
                }));
                  
              }

             var standardFils = searchObj.filters;
			standardFils = standardFils.concat(filters);
			 searchObj.filters = standardFils
          
           var weekStartDate = wpmReq.getValue('custrecord_wpm_week_start_date')
		   var weekEndDate = wpmReq.getValue('custrecord_wpm_week_endate')
           var wpmRecObj = getAllSavedRecords(weekStartDate,weekEndDate);
		   log.debug('wpmRecObj',wpmRecObj);
		   
            var i = 0;
            searchObj.run().each(function(result) {

                var salesRep = result.getValue({
                    name: "custrecord_rep_name",
                    summary: "GROUP",
                    label: "Rep Name"
                });

                var salerepObj = wpmRecObj[Number(salesRep)];
				 var recObj = '';
				if(salerepObj){
					recObj = record.load({
						 type: 'customrecord_wpm_report',
						 id : salerepObj.wpmId
					})
				}else{
					
					  recObj = record.create({
						type: 'customrecord_wpm_report'
					});
				}
				
               
                

                var salesRepName = result.getText({
                    name: "custrecord_rep_name",
                    summary: "GROUP",
                    label: "Rep Name"
                });

               var salesTerritory = result.getText({
         name: "custentity_jg_employee_sales_territory",
         join: "CUSTRECORD_REP_NAME",
         summary: "GROUP",
         label: "Sales Territory"
      })
                
                recObj.setValue('custrecord_wpm_sales_rep', salesRep);
                recObj.setValue('custrecord_wpm_week_sd', wpmReq.getValue('custrecord_wpm_week_start_date'));
                recObj.setValue('custrecord_wpm_week_ed', wpmReq.getValue('custrecord_wpm_week_endate'));
                recObj.setValue('custrecord_wpm_req', wpmReq.id);

                try {
                  
                  var recId = recObj.save();
                   fileNames.push(salesTerritory+'_'+wpmReq.id + '_' + salesRepName+'_'+recId);
                  log.debug('record saved')
                  
                    i++;
                } catch (e) {
                    log.debug('error printing->' + salesRepName)
                }


                return true;



            });


 log.debug('fileNames',fileNames)
            var urls = getFileUrls(fileNames)
           // var urls = ["/core/media/media.nl?id=23154&c=953134_SB2&h=Y_olfbk7MknSAOmljLP7HIHn9wPuJ9Hc8SnUxnjQPoPrGYfX&_xt=.pdf", "/core/media/media.nl?id=23155&c=953134_SB2&h=F3sdsOaIOX-4GQu-InclX7DwwHdAI4h3JxvExL6gLVT7eDmx&_xt=.pdf", "/core/media/media.nl?id=23156&c=953134_SB2&h=b8tm4C5bMhpFxvYvJypx9IGl6at1zSoWDwt_6QIuN64X8R6D&_xt=.pdf", "/core/media/media.nl?id=23157&c=953134_SB2&h=j6rP4iXADTI1bZNfjJbDRPlvn-y4gEs5VfzzSxLsuVBb2s-K&_xt=.pdf", "/core/media/media.nl?id=23158&c=953134_SB2&h=f7MyA4vDXeWotxW_Br4kzYeN_Pf4LbtWjdEEsSnJCt-MX244&_xt=.pdf", "/core/media/media.nl?id=23159&c=953134_SB2&h=z1WMhuPniXcTScu2seXhWsNJ0iWZPKl1MfaQI475w059tlmD&_xt=.pdf", "/core/media/media.nl?id=23160&c=953134_SB2&h=OgjAu2l1A10k-0MvyTVumiUu6EPDcVkm1FIXEswVyJa7hAys&_xt=.pdf", "/core/media/media.nl?id=23161&c=953134_SB2&h=1X0nHmcfRKuA3py2J0nSPSQQAA2quRkFbEAkjbmNZdaZ0jKm&_xt=.pdf", "/core/media/media.nl?id=23162&c=953134_SB2&h=-RncPpiIbGaiagCRl-oMyG65CGN-ZJxH1GaM6_X_dg0DtabM&_xt=.pdf", "/core/media/media.nl?id=23163&c=953134_SB2&h=M2XHAjVDozDTlpeuUXLPIitddNi-AU4R1yby_G7ASqmE9Gh6&_xt=.pdf", "/core/media/media.nl?id=23164&c=953134_SB2&h=ofJRMmATCvYB9b3PuAKJv6jv0AUYIxfFzVwyYVbCJXQS1BLe&_xt=.pdf", "/core/media/media.nl?id=23165&c=953134_SB2&h=r-GiSooHrbgyR9gyCurm5jBFwUwvqItLsTNXfi2fVqDHReFA&_xt=.pdf", "/core/media/media.nl?id=23166&c=953134_SB2&h=_eGs8VREv9kReZdmwgSeURjIFwx5Au9PrLmWn8xAo8JKYkGY&_xt=.pdf", "/core/media/media.nl?id=23167&c=953134_SB2&h=adG09Xy9-IrDp39J1rsGAeM4NYSiduQrCPX5rvFhpcY6wzvt&_xt=.pdf", "/core/media/media.nl?id=23168&c=953134_SB2&h=6JNT0kjvnrR70tdZQ9JY7WSE_YMQfar83-cgCcS4PF0hQ4EP&_xt=.pdf", "/core/media/media.nl?id=23169&c=953134_SB2&h=SQoVNe3yvKcforbkRin4MB6dhvu_T9gY-JCBcehQoFy88F5N&_xt=.pdf", "/core/media/media.nl?id=23170&c=953134_SB2&h=GVkImIBd6iIeQYXE1ptUdSdiWG0aPcLwFt-5fK0nfLng6Pcf&_xt=.pdf", "/core/media/media.nl?id=23171&c=953134_SB2&h=kRwO2a0X-m9Dw-iJhj58j0fZiXgzbSoOtNidNjpvV-DDFPhf&_xt=.pdf", "/core/media/media.nl?id=23172&c=953134_SB2&h=hyNyQUFrr_kLcnlssTNyuTPrI8QI_Y_TzryEm86ZHQl6WfMl&_xt=.pdf", "/core/media/media.nl?id=23173&c=953134_SB2&h=PpNjFfLMdk2bqsSaDPkfdphRqTYkV-oXZ3OliQQY4BH10TaJ&_xt=.pdf", "/core/media/media.nl?id=23174&c=953134_SB2&h=hMouMesdTwnqhwd_ta6j1DGi-H3io5On-hAe42SM8x_8WJEk&_xt=.pdf", "/core/media/media.nl?id=23175&c=953134_SB2&h=Yq2HQaI8isigUM7tTHccyubXmCTpMFVSDpL0NRF9GmmLx-16&_xt=.pdf", "/core/media/media.nl?id=23176&c=953134_SB2&h=Wq4XucxzO7UnTEM3WOASGqjo8COG2sQkEZtYYQJTwp02Y5iy&_xt=.pdf", "/core/media/media.nl?id=23177&c=953134_SB2&h=i4EJUTFzk-Eh-SUc9_lQ7MiIRbxlYCXpdwPGSR1R2KzfZHSB&_xt=.pdf", "/core/media/media.nl?id=23178&c=953134_SB2&h=t6c4ivXPXYH31GLBAzQ89iUXox0Wx7-Chi5HTLcEQZlsSCHY&_xt=.pdf", "/core/media/media.nl?id=23179&c=953134_SB2&h=jC4Dp6bvpvwUdAd-t8syjfVQLpguJCdhKMo89k3R94N8u4Hw&_xt=.pdf", "/core/media/media.nl?id=23180&c=953134_SB2&h=iWeaL1rPUlmZZmYw1M2JSSWI3LwdJ43ynpjQltFZD0sqOdlU&_xt=.pdf", "/core/media/media.nl?id=23181&c=953134_SB2&h=o8j8-HY35z9KEJgaAK0LyZG2XRhmr_fSmVOpTvu-dk9vDX9i&_xt=.pdf", "/core/media/media.nl?id=23182&c=953134_SB2&h=bPjkWgFg7-NAsd2B1Hs0hj-LGnndOWG31VNjKRmGXn9zHkNx&_xt=.pdf", "/core/media/media.nl?id=23183&c=953134_SB2&h=fOaX-_tShIa9qrzmwIgODMw_W4a4g7TWawvDnbSgPdx3RBIz&_xt=.pdf", "/core/media/media.nl?id=23184&c=953134_SB2&h=dz28rCyCbUrnoCzUmkZfgKZ2JTkxaIXAj5wnS31ix0aHgFJx&_xt=.pdf", "/core/media/media.nl?id=23185&c=953134_SB2&h=tROgF0tIz1vEwcmsvWH83YkbdbkwuqhJWjfYzS1hZmpfQP80&_xt=.pdf", "/core/media/media.nl?id=23186&c=953134_SB2&h=9v7UqX6krrUe-gu02JOjYn5IGBEOiYsAy0svq6YT4HoZQ8Rg&_xt=.pdf", "/core/media/media.nl?id=23187&c=953134_SB2&h=2AfhQuarYO5NdZapf_5hNjn9R5boRYzfkcPXFtWgHfAbXmDg&_xt=.pdf", "/core/media/media.nl?id=23188&c=953134_SB2&h=ENAZl4h8kCW5bQP2qSSEgpvyh2xZO_c3EFhG7FwJdip0NOav&_xt=.pdf", "/core/media/media.nl?id=23189&c=953134_SB2&h=q4CCtVs_qK7_NkvRGsugVU63aI9vf0ue3vE5E6dI9LMPepar&_xt=.pdf", "/core/media/media.nl?id=23190&c=953134_SB2&h=XPIOjG-wjsYOyG9VCoLwSfZ_cN9kNAkPH9HFaWBTh4R9WcH8&_xt=.pdf"]
            var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
            xml += "<pdfset>";


            urls.forEach(function(res) {

                xml += "<pdf src='" + xmlObj.escape(res) + "'/>";
               // xml += '</pdf>'


            });

            xml += '</pdfset>'

            var pdfFile = render.xmlToPdf({
                xmlString: xml
            });

            pdfFile.folder = 120863
            pdfFile.name = "WPM_REPORT_"+new Date()
            var pdfFileId = pdfFile.save();
            log.debug('pdfFileId', pdfFileId);
          if(pdfFileId){
                wpmReq.setValue('custrecord_wpm_report',pdfFileId)
          }
          wpmReq.save();
        }




          function getAllSavedRecords(weekStartDate,weekEndDate){
			  
			  
			   var starDate = format.format({
                    value: weekStartDate,
                    type: format.Type.DATE
                })
				
				 var endDate = format.format({
                    value: weekEndDate,
                    type: format.Type.DATE
                })
			  var customrecord_wpm_reportSearchObj = search.create({
			   type: "customrecord_wpm_report",
			   filters:
			   [
				  ["custrecord_wpm_week_sd","onorafter",starDate], 
				  "AND", 
				  ["custrecord_wpm_week_ed","onorbefore",endDate]
			   ],
			   columns:
			   [
				  search.createColumn({name: "custrecord_wpm_sales_rep", label: "Sales Rep"})
			   ]
			});
			
			var salesRepObj = {};
			var searchResultCount = customrecord_wpm_reportSearchObj.runPaged().count;
			log.debug("customrecord_wpm_reportSearchObj result count",searchResultCount);
			customrecord_wpm_reportSearchObj.run().each(function(result){
				var salesRep = Number(result.getValue('custrecord_wpm_sales_rep'));
				if(salesRep){
					 salesRepObj[salesRep] = {
						 wpmId : result.id
					 }
				}
			    
			   return true;
			});
			
			return salesRepObj

/*
customrecord_wpm_reportSearchObj.id="customsearch1717156278259";
customrecord_wpm_reportSearchObj.title="WPM Report Search (copy)";
var newSearchId = customrecord_wpm_reportSearchObj.save();
*/
			  
		  }
        function getFileUrls(fileNames) {
            var fileUrls = [];
            log.debug('fileNames', fileNames)
            var filters = [
                [
                    ["name", "is", "TEST"]
                ],
            ]


            fileNames.forEach(function(res) {

                filters.push("OR")
                filters.push([
                    ["name", "is", res]
                ])

            })
            var fileSearchObj = search.create({
                type: "file",
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "name",
                        label: "Name",
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: "folder",
                        label: "Folder"
                    }),
                    search.createColumn({
                        name: "documentsize",
                        label: "Size (KB)"
                    }),
                    search.createColumn({
                        name: "url",
                        label: "URL"
                    }),
                    search.createColumn({
                        name: "created",
                        label: "Date Created"
                    }),
                    search.createColumn({
                        name: "modified",
                        label: "Last Modified"
                    }),
                    search.createColumn({
                        name: "filetype",
                        label: "Type"
                    })
                ]
            });
            var searchResultCount = fileSearchObj.runPaged().count;
            log.debug("fileSearchObj result count", searchResultCount);
            fileSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
               var fileName = result.getValue('name');
              fileName = fileName.toLowerCase();
               if(fileName != 'test' )
            {
                  fileUrls.push(result.getValue('url'))
                return true;
               }
               
            });

            log.debug('fileUrls', fileUrls)
            return fileUrls

        }


        function getAllSubordinates(supervisor){
              var salesRepIds = [];
             var employeeSearchObj = search.create({
   type: "employee",
   filters:
   [
      ["supervisor","anyof",supervisor], 
      "AND", 
      ["custentity_jg_employee_sales_role","anyof","1","3"]
   ],
   columns:
   [
      search.createColumn({name: "supervisor", label: "Supervisor"}),
      search.createColumn({name: "firstname", label: "First Name"}),
      search.createColumn({name: "lastname", label: "Last Name"}),
      search.createColumn({name: "internalid", label: "Internal ID"})
   ]
});
var searchResultCount = employeeSearchObj.runPaged().count;
log.debug("employeeSearchObj result count",searchResultCount);
employeeSearchObj.run().each(function(result){
   // .run().each has a limit of 4,000 results
  salesRepIds.push(result.id)
   return true;
});

/*
employeeSearchObj.id="customsearch1716395306388";
employeeSearchObj.title="Supervisor Search (copy)";
var newSearchId = employeeSearchObj.save();
*/
return salesRepIds;
             
        }

        return {
            execute
        }

    });