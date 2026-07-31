{{- define "ai-tos.namespace" -}}
{{- .Values.global.namespace | default "ai-tos" -}}
{{- end -}}
