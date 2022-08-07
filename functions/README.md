# Getting Started
1. Install [Docker](https://docs.docker.com/get-started/)
1. Install [aws CLI](https://docs.aws.amazon.com/cli/v1/userguide/install-macos.html#awscli-install-osx-pip)

# Test locally
1. Build the Docker image: `docker build -t lambda-index-fc-users --build-arg MAIN=index-users.js .`
1. Run the image:
```
docker run --rm -p 9000:8080 -e SUPABASE_API_KEY='<SUPABASE_API_KEY>' -e SUPABASE_URL='<SUPABASE_URL>' -e GRAPH_API_URL='<GRAPH_API_URL>' lambda-index-fc-users
```
1. Invoke the function:
```
aws lambda invoke \
--region us-east-2 \
--endpoint http://localhost:9000 \
--no-sign-request \
--function-name function \
output.txt
```

# Deploy
1. Login to AWS ERC: `aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 985583747716.dkr.ecr.us-east-2.amazonaws.com`
1. Create a tag: `docker tag lambda-index-fc-users:latest 985583747716.dkr.ecr.us-east-2.amazonaws.com/lambda-index-fc-users:latest`
1. Push the latest image to our ERC repo: `docker push 985583747716.dkr.ecr.us-east-2.amazonaws.com/lambda-index-fc-users:latest`
