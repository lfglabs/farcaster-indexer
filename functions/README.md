# Getting Started

1. Install [Docker](https://docs.docker.com/get-started/)
1. Install [aws CLI](https://docs.aws.amazon.com/cli/v1/userguide/install-macos.html#awscli-install-osx-pip)

# Test locally

1. Build the Docker image:

```
docker build -t lambda-index-fc-accounts --build-arg MAIN=index-accounts.js .
```

2. Run the image:

```
docker run --rm -p 9000:8080 -e SUPABASE_API_KEY='<SUPABASE_API_KEY>' -e SUPABASE_URL='<SUPABASE_URL>' -e GRAPH_API_URL='<GRAPH_API_URL>' lambda-index-fc-accounts
```

3. Invoke the function:

```
aws lambda invoke \
--region us-east-2 \
--endpoint http://localhost:9000 \
--no-sign-request \
--function-name function \
output.txt
```

For other functions, replace `lambda-index-fc-accounts` and `index-accounts.js` with the corresponding name.

# Deploy

1. Login to AWS ERC:

```
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 985583747716.dkr.ecr.us-east-2.amazonaws.com
```

2. Build the Docker image:

```
docker build -t lambda-index-fc-accounts --build-arg MAIN=index-accounts.js .
```

3. Create a tag:

```
docker tag lambda-index-fc-accounts:latest 985583747716.dkr.ecr.us-east-2.amazonaws.com/lambda-index-fc-accounts:latest
```

4. Push the latest image to our ERC repo:

```
docker push 985583747716.dkr.ecr.us-east-2.amazonaws.com/lambda-index-fc-accounts:latest
```

5. Use the AWS console and update Docker image of the corresponding Lambda function.

For other functions, replace `lambda-index-fc-accounts` and `index-accounts.js` with the corresponding name.
