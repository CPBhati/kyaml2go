//const URL = "http://localhost:8080/v1/convert"
let BASE_URL = "https://kyaml2go-oymillvkxq-uc.a.run.app/v1/convert?method="

let go = document.getElementById("goGenerator")
let codecopied = document.getElementById("codecopied")
let editor = ""
let CRDetailValid = true

window.generatorCall=function (action, query){
  URL = formGooleFuncURL(action)+query

  let yamlData  = document.getElementById("codegen").value
  document.getElementById('codegen').style.border = "1px solid #ced4da"
  yamlData = editor.getValue()
  $.ajax({
    'url' : `${URL}`,
    'type' : 'POST',
    'data' : yamlData,
    'success' : function(data) {
        document.getElementById("error").style.display="none"
        document.getElementById("err-span").innerHTML="";
        go.setValue(data)
    },
    'error' : function(jqXHR, request,error)
    {
      document.getElementById('codegen').style.border = "1px solid red"
      if (jqXHR.status == 400) {
        // empty out the second textarea
        displayError('Invalid Kubernetes resource spec. Please check the spec and try again.')
      } else {
        displayError('Something went wrong! Please report this to https://github.com/PrasadG193/kyaml2go/issues')
      }
    }
  });

}

function formGooleFuncURL(action){
  return BASE_URL+action
}

// checks if cr checkbox is checked
function isCRChecked(){
  return document.getElementById("cr_check").checked
}

function getValue(id){
  v = document.getElementById(id).value
  if (v.length ==0){
    CRDetailValid = false
  }
  return v
}

//Convert
dropDown = document.getElementById("selectaction")
document.getElementById("convert").addEventListener('click', ()=>{
  action = dropDown.value
  if (action != "select"){
    hideError()
    query =""
    if (isCRChecked()){
      CRDetailValid = true
      scheme = getValue("scheme").trim()
      apis = getValue("apis").trim()
      clients  = getValue("client").trim()

      query = "&cr=true&scheme="+scheme+"&apis="+apis+"&client="+clients
    }

    if (CRDetailValid){
      go.setValue("Generating...")
      hideError()
      generatorCall(action, query)
    } else{
      displayError("Please enter correct CR details")
    }
  }
  else{
    displayError("Please select the method.")
  }
})

//Clear YAML
document.getElementById('clearYaml').addEventListener('click',()=>{
  editor.setValue('')
})

//Clear Go
document.getElementById('clearGo').addEventListener('click',()=>{
  go.setValue('')
})


$(document).ready(function(){
  //code here...
  var input = $(".codemirror-textarea")[0];
  var output = $(".codemirror-textarea")[1];
  editor = CodeMirror.fromTextArea(input, {
    mode: "text/x-yaml",
    lineNumbers : true
  });

  go = CodeMirror.fromTextArea(output, {
    lineNumbers : true,
    mode: "text/x-go"
  });


  // Add sample input
  editor.setValue(`# Paste your Kubernetes yaml spec here...
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo
  template:
    metadata:
      labels:
        app: demo
    spec:
      containers:
      - image: nginx:1.12
        imagePullPolicy: IfNotPresent
        name: web
        ports:
        - containerPort: 80
          name: http
          protocol: TCP
`)

  // Add sample output
  go.setValue(`// Auto-generated by kyaml2go - https://github.com/PrasadG193/kyaml2go
package main

import (
	"fmt"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	"os"
	"path/filepath"
)

func main() {
	// Create client
	var kubeconfig string
	kubeconfig, ok := os.LookupEnv("KUBECONFIG")
	if !ok {
		kubeconfig = filepath.Join(homedir.HomeDir(), ".kube", "config")
	}

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		panic(err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	kubeclient := clientset.AppsV1().Deployments("default")

	// Create resource object
	object := &appsv1.Deployment{
		TypeMeta: metav1.TypeMeta{
			Kind:       "Deployment",
			APIVersion: "apps/v1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name: "test-deployment",
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: ptrint32(2),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{
					"app": "demo",
				},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app": "demo",
					},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						corev1.Container{
							Name:  "web",
							Image: "nginx:1.12",
							Ports: []corev1.ContainerPort{
								corev1.ContainerPort{
									Name:          "http",
									HostPort:      0,
									ContainerPort: 80,
									Protocol:      corev1.Protocol("TCP"),
								},
							},
							Resources:       corev1.ResourceRequirements{},
							ImagePullPolicy: corev1.PullPolicy("IfNotPresent"),
						},
					},
				},
			},
			Strategy:        appsv1.DeploymentStrategy{},
			MinReadySeconds: 0,
		},
	}

	// Manage resource
	_, err = kubeclient.Create(object)
	if err != nil {
		panic(err)
	}
	fmt.Println("Deployment Created successfully!")
}

func ptrint32(p int32) *int32 {
	return &p
}
  `)
});

function displayError(err){
  document.getElementById("err-span").innerHTML=err;
  document.getElementById("error").style.display="block"
}

function hideError(){
  document.getElementById("err-span").innerHTML="";
  document.getElementById("error").style.display="none"
}

document.getElementById("copybutton").addEventListener("click", function (){
  // will have to check browser compatibility for this
  navigator.clipboard.writeText(go.getValue())
  codecopied.style.display="inline"
  window.setTimeout(function (){
    codecopied.style.display="none"
  }, 500)
});

document.getElementById("cr_check").addEventListener("change", function (){
  if (isCRChecked()){
    document.getElementById("cr_params").style.display = "block"
  } else {
    document.getElementById("cr_params").style.display = "none"
  }

});
