export type ValidateReqParamsProps = {
  reqBody?: any;
  reqParams?: any;
  reqQuery?: any;
};

export type ValidateReqFile = (file: Express.Multer.File) => boolean | string;

export type ValidateReqParams = (
  props: ValidateReqParamsProps
) => boolean | string;
