"use strict";(()=>{var e={};e.id=625,e.ids=[625],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9517:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>c,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>u});var i={};t.r(i),t.d(i,{POST:()=>p});var a=t(9303),o=t(8716),n=t(670),s=t(7070),l=t(1202);async function p(e){let r=Date.now();try{l.k.log(1,"Email preparation request received","email/prepare/route.ts","POST");let t=await e.json(),{itineraryId:i,includeAttachment:a=!0,customMessage:o=""}=t;if(l.k.log(2,"Request parsed","email/prepare/route.ts","POST",{itineraryId:i,includeAttachment:a,hasCustomMessage:!!o}),!i)return l.k.error(3,"Missing itineraryId in request","email/prepare/route.ts","POST","ValidationError: itineraryId is required"),s.NextResponse.json({error:"itineraryId is required",success:!1},{status:400});l.k.log(4,"Retrieving itinerary data","email/prepare/route.ts","POST",{itineraryId:i});let n={summary:{location:"Paris, France",duration:"5 days",travelers:"2 adults",budget:"$3000 USD",theme:"Cultural exploration"},dailyActivities:[{day:1,date:"2024-06-01",activities:[{time:"09:00",title:"Arrival and hotel check-in",description:"Arrive in Paris and settle into your accommodation",location:"Hotel in city center"},{time:"14:00",title:"Visit Eiffel Tower",description:"Iconic landmark visit with guided tour",location:"Champ de Mars, 5 Avenue Anatole France"}]},{day:2,date:"2024-06-02",activities:[{time:"10:00",title:"Louvre Museum",description:"Explore world-famous art collection",location:"Rue de Rivoli, 75001 Paris"}]}],travelTips:[{category:"transportation",priority:"high",title:"Use Paris Metro",content:"The metro is efficient and covers the entire city"},{category:"food",priority:"medium",title:"Try local bakeries",content:"Fresh croissants and pastries are a must-try"}]},p=null;a&&(l.k.log(6,"Generating PDF attachment","email/prepare/route.ts","POST"),p=`${e.nextUrl.origin}/api/itinerary/export/pdf?itineraryId=${i}&format=standard`,l.k.log(7,"PDF attachment URL generated","email/prepare/route.ts","POST",{attachmentUrl:p})),l.k.log(8,"Generating email content","email/prepare/route.ts","POST");let d=`Your Personalized Itinerary: ${n.summary.location}`,c=o?`<p><strong>Personal Note:</strong> ${o.replace(/\n/g,"<br>")}</p>`:"",u=`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Itinerary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .day { margin: 20px 0; border-left: 4px solid #667eea; padding-left: 15px; }
        .activity { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
        .tips { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Personalized Travel Itinerary</h1>
        <p>Created especially for your trip to ${n.summary.location}</p>
    </div>

    <div class="content">
        ${c}

        <div class="summary">
            <h2>Trip Summary</h2>
            <p><strong>Destination:</strong> ${n.summary.location}</p>
            <p><strong>Duration:</strong> ${n.summary.duration}</p>
            <p><strong>Travelers:</strong> ${n.summary.travelers}</p>
            <p><strong>Budget:</strong> ${n.summary.budget}</p>
            <p><strong>Theme:</strong> ${n.summary.theme}</p>
        </div>

        <h2>Daily Itinerary</h2>
        ${n.dailyActivities.map(e=>`
            <div class="day">
                <h3>Day ${e.day}: ${new Date(e.date).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</h3>
                ${e.activities.map(e=>`
                    <div class="activity">
                        <strong>${e.time} - ${e.title}</strong><br>
                        ${e.description}<br>
                        <em>Location: ${e.location}</em>
                    </div>
                `).join("")}
            </div>
        `).join("")}

        <div class="tips">
            <h2>Travel Tips</h2>
            ${n.travelTips.map(e=>`
                <div style="margin: 10px 0;">
                    <strong>${e.title}</strong> (${e.category})<br>
                    ${e.content}
                </div>
            `).join("")}
        </div>
    </div>

    <div class="footer">
        <p>This itinerary was generated using AI to create a personalized travel experience.</p>
        <p>For questions or modifications, please contact our support team.</p>
    </div>
</body>
</html>`;l.k.log(9,"Email content generated","email/prepare/route.ts","POST",{subjectLength:d.length,bodyLength:t.length,hasAttachment:!!p});let g=Date.now()-r;return l.k.log(10,"Email preparation completed successfully","email/prepare/route.ts","POST",{itineraryId:i,processingTimeMs:g}),s.NextResponse.json({success:!0,emailData:{subject:d,body:u,attachmentUrl:p}})}catch(t){let e=Date.now()-r;return l.k.error(11,"Unexpected error in email preparation","email/prepare/route.ts","POST",t instanceof Error?t:String(t),{processingTimeMs:e}),s.NextResponse.json({error:"Internal server error",success:!1,message:"An unexpected error occurred. Please try again."},{status:500})}}let d=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/itinerary/email/prepare/route",pathname:"/api/itinerary/email/prepare",filename:"route",bundlePath:"app/api/itinerary/email/prepare/route"},resolvedPagePath:"C:\\Users\\raze0\\Documents\\vercel_deploy\\hylo00_original\\src\\app\\api\\itinerary\\email\\prepare\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:c,staticGenerationAsyncStorage:u,serverHooks:g}=d,m="/api/itinerary/email/prepare/route";function h(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:u})}},1202:(e,r,t)=>{var i,a,o,n,s;t.d(r,{k:()=>p}),function(e){e.USD="USD",e.EUR="EUR",e.GBP="GBP",e.CAD="CAD",e.AUD="AUD"}(i||(i={})),function(e){e.TOTAL="total",e.PER_PERSON="per-person"}(a||(a={})),function(e){e.PENDING="pending",e.PROCESSING="processing",e.COMPLETE="complete",e.ERROR="error"}(o||(o={})),function(e){e.SUCCESS="Success",e.ERROR="Error",e.WARNING="Warning"}(n||(n={})),function(e){e.HIGH="High",e.MEDIUM="Medium",e.LOW="Low"}(s||(s={}));class l{static instance;logLevel;logs=[];maxLogs=1e3;constructor(){this.logLevel=process.env.ITINERARY_LOG_LEVEL||"info"}static getInstance(){return l.instance||(l.instance=new l),l.instance}shouldLog(e){let r=["silent","error","warn","info","debug"],t=r.indexOf(this.logLevel);return r.indexOf(e)<=t}log(e,r,t,i,a={},o,s=n.SUCCESS){if(!this.shouldLog("info"))return;let l={stepNumber:e,action:r,fileName:t,functionName:i,timestamp:new Date().toISOString(),data:a,...void 0!==o&&{duration:o},status:s};this.logs.push(l),this.logs.length>this.maxLogs&&this.logs.shift();try{console.log(`Step ${e}: ${r} in ${t} - ${i}`,l)}catch(t){console.error(`Step ${e}: Logging failed for ${r}`,{error:t instanceof Error?t.message:String(t)})}}error(e,r,t,i,a,o={}){if(!this.shouldLog("error"))return;let s=a instanceof Error?a.message:a;this.log(e,r,t,i,{...o,error:s},void 0,n.ERROR)}warn(e,r,t,i,a,o={}){this.shouldLog("warn")&&this.log(e,r,t,i,{...o,warning:a},void 0,n.WARNING)}debug(e,r,t,i,a={}){this.shouldLog("debug")&&this.log(e,`DEBUG: ${r}`,t,i,a,void 0,n.SUCCESS)}getLogs(){return[...this.logs]}clearLogs(){this.logs=[]}}let p=l.getInstance()}};var r=require("../../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[948,972],()=>t(9517));module.exports=i})();