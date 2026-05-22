# Self-hosted Kubernetes deployment

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- `kubectl` configured
- Container images built and pushed to your registry (update image names in manifests)

## Deploy

```bash
# Build and tag images (example)
docker build -t your-registry/llm-logger-backend:latest ./backend
docker build -t your-registry/llm-logger-frontend:latest ./frontend

# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml.example   # copy and edit first
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml          # optional
```

## Access

- Frontend Service: `llm-logger-frontend` on port 3000
- Backend Service: `llm-logger-backend` on port 8000
- Configure Ingress host in `ingress.yaml` for external access

## Notes

- Set `DATABASE_URL` to MongoDB (Atlas or in-cluster) in the Secret.
- Set real API keys in the Secret before disabling `MOCK_LLM`.
- For production, use managed MongoDB and an external message queue instead of in-process events.
