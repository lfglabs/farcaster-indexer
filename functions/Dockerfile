FROM amazon/aws-lambda-nodejs:16
ARG MAIN
COPY $MAIN ${LAMBDA_TASK_ROOT}/main.js
COPY package.json ${LAMBDA_TASK_ROOT}
RUN npm install
COPY lib ${LAMBDA_TASK_ROOT}/lib
CMD ["main.handler"]
