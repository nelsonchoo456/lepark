import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Button } from 'antd';
import moment from 'moment';
import { PlantTaskResponse, PlantTaskTypeEnum, PlantTaskUpdateData } from '@lepark/data-access';
import { formatEnumLabelToRemoveUnderscores } from '@lepark/data-utility';

interface EditPlantTaskModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: PlantTaskUpdateData) => Promise<void>;
  initialValues: PlantTaskResponse | null;
}

const EditPlantTaskModal: React.FC<EditPlantTaskModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        taskType: initialValues.taskType,
        taskUrgency: initialValues.taskUrgency,
        dueDate: moment(initialValues.dueDate),
        description: initialValues.description,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: PlantTaskUpdateData) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Edit Plant Task"
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
          <Select>
            {Object.values(PlantTaskTypeEnum).map((type) => (
              <Select.Option key={type} value={type}>
                {formatEnumLabelToRemoveUnderscores(type)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="taskUrgency" label="Task Urgency" rules={[{ required: true }]}>
          <Select>
            {['IMMEDIATE', 'HIGH', 'NORMAL', 'LOW'].map((urgency) => (
              <Select.Option key={urgency} value={urgency}>
                {formatEnumLabelToRemoveUnderscores(urgency)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Task
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPlantTaskModal;