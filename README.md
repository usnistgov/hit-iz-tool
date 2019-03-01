# hit-iz-tool
This is immunization tool repository. The iz tool is also used for the ONC Meaningful use stage 3 certification program


# Deployment Processes

## Prerequisites  
- maven 3+  
- java 8+  
- Git 
- Nodejs  
- Npm  
- Grunt   

## NIST IZ Tool  
### Depencencies 
- hit-core: https://github.com/usnistgov/hit-core (branch legacy)
- hit-core-hl7v2: https://github.com/usnistgov/hit-core-hl7v2 (branch legacy)
- hit-core-xml:https://github.com/usnistgov/hit-core-xml (branch master. 
  - Build only the following modules 
    - hit-core-xml-domain: https://github.com/usnistgov/hit-core-xml/hit-core-domain  (branch master)
    - hit-core-xml/hit-core-xml-repo: https://github.com/usnistgov/hit-core-xml/hit-core-repo  (branch master) 
- hit-xml-validation: https://github.com/usnistgov/hit-xml-validation (branch ) 
- schematronValidation : https://github.com/usnistgov/schematronValidation (branch master) 

## HIMSS IZ Tool  
### Depencencies 

- hit-core: https://github.com/usnistgov/hit-core (branch master)
- hit-core-hl7v2: https://github.com/usnistgov/hit-core-hl7v2 (branch master)
- hit-core-xml:https://github.com/usnistgov/hit-core-xml (branch master. 
  - Build only the following modules 
    - hit-core-xml-domain: https://github.com/usnistgov/hit-core-xml/hit-core-domain  (branch master)
    - hit-core-xml/hit-core-xml-repo: https://github.com/usnistgov/hit-core-xml/hit-core-repo  (branch master) 
- hit-xml-validation: https://github.com/usnistgov/hit-xml-validation (branch ) 
- schematronValidation : https://github.com/usnistgov/schematronValidation (branch master) 

### How to build the project 
- frontend 
<pre>
git clone  https://github.com/usnistgov/hit-iz-tool  # clone the repo   
cd hit-iz-tool  
git checkout apps/cni-new # switch to the NIST branch  
cd hit-iz-web/client # Nagivate to the client folder  
npm install # if first time only.  Install dependencies and   
grunt build # build the client  
</pre>

- backend 
<pre>
cd hit-iz-tool 
mvn clean install  # generate and install the war file to .m2 repo  
</pre>




