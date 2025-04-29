import { FormModel } from '../templates/form-model';

export const HomeModelConfig = () => {
  return <FormModel 
    name="Model"
    description="Model"
    imageURI={<img src="https://via.placeholder.com/150" alt="Model" />}
    modelSelection={<ButtonModel name="Model" onClick={() => {}} isActive={false} position={0} />}
    loraSelection={<ButtonModel name="Lora" onClick={() => {}} isActive={false} position={0} />}
    config={<ButtonModel name="Config" onClick={() => {}} isActive={false} position={0} />} />;
};
