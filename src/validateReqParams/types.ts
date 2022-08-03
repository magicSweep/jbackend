export type ValidateReqParamsProps = {
  reqBody?: any;
  reqParams?: any;
  reqQuery?: any;
};

export type ValidateReqParams = (
  props: ValidateReqParamsProps
) => boolean | string;
