package generator

import (
	crScheme "k8s.io/sample-controller/pkg/generated/clientset/versioned/scheme"
	"k8s.io/client-go/kubernetes/scheme"
	apiextv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextv1beta1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
)

func setScheme() {
	apiextv1.AddToScheme(scheme.Scheme)
	apiextv1beta1.AddToScheme(scheme.Scheme)
	crScheme.AddToScheme(scheme.Scheme)
}
