import { makePrivateRequest, makeRequest } from 'core/utils/request';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useHistory, useParams } from 'react-router';
import { toast } from 'react-toastify';
import Select from 'react-select';
import BaseForm from '../../BaseForm';
import './styles.scss';
import { Category } from 'core/types/Product';
import PriceField from './PriceField';

export type FormState = {
    name: string;
    price: string;
    description: string;
    imgUrl: string;
    categories: Category[];
}

type ParamsType = {
    productId: string;
}

const Form = () => {
    const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<FormState>();
    const history = useHistory();
    const { productId } = useParams<ParamsType>();
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const isEditing = productId !== 'create';
    const formTitle = isEditing ? 'Editar produto' : 'Cadastrar produto'

    useEffect(() => {
        if (isEditing) {
            makeRequest({ url: `/products/${productId}` })
                .then(response => {
                    setValue('name', response.data.name);
                    setValue('price', response.data.price);
                    setValue('description', response.data.description);
                    setValue('imgUrl', response.data.imgUrl);
                    setValue('categories', response.data.categories)
                })
        }
    }, [productId, isEditing, setValue]);

    useEffect(() => {
        setIsLoadingCategories(true);
        makeRequest({ url: '/categories' })
            .then(response => setCategories(response.data.content))
            .finally(() => setIsLoadingCategories(false));
    }, []);

    const onSubmit = (data: FormState) => {
        console.log(data)
        makePrivateRequest({
            url: isEditing ? `/products/${productId}` : '/products',
            method: isEditing ? 'PUT' : 'POST',
            data
        })
            .then(() => {
                toast.info('Produto salvo com sucesso!.')
                history.push('/admin/products');
            })
            .catch(() => {
                toast.error('Erro ao salvar produto!.')
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <BaseForm
                title={formTitle}
            >
                <div className="product-form-container">
                    <div className="col-6">
                        <div className="margin-botton-30">
                            <input
                                ref={register({
                                    required: "Campo obrigatório",
                                    minLength: { value: 5, message: "O campo deve ter no mínimo 5 caracteres!" },
                                    maxLength: { value: 60, message: "O campo deve ter no mínimo 60 caracteres!" }
                                })}
                                name="name"
                                type="text"
                                className="form-control input-base"
                                placeholder="Nome do produto"
                            />
                            {errors.name && (
                                <div className="invalid-feedback d-block">
                                    {errors.name.message}
                                </div>
                            )}
                        </div>
                        <div className="margin-botton-30">
                            <Controller
                                as={Select}
                                defaultValue=""
                                name="categories"
                                rules={{ required: true }}
                                control={control}
                                isLoading={isLoadingCategories}
                                options={categories}
                                getOptionLabel={(option: Category) => option.name}
                                getOptionValue={(option: Category) => String(option.id)}
                                classNamePrefix="categories-select"
                                placeholder="Categorias"
                                inputId="categories"
                                isMulti
                            />
                            {errors.categories && (
                                <div className="invalid-feedback d-block">
                                    Campo obrigatório
                                </div>
                            )}
                        </div>
                        <div className="margin-botton-30">
                            <PriceField control={control} />
                            {errors.price && (
                                <div className="invalid-feedback d-block">
                                    {errors.price.message}
                                </div>
                            )}
                        </div>
                        <div className="margin-botton-30">
                            <input
                                ref={register({ required: "Campo obrigatório" })}
                                type="text"
                                name="imgUrl"
                                className="form-control input-base"
                                placeholder="Entre com a URL da imagem"
                            />
                            {errors.imgUrl && (
                                <div className="invalid-feedback d-block">
                                    {errors.imgUrl.message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-6">
                        <textarea
                            ref={register({ required: "Campo obrigatório" })}
                            placeholder="Descrição"
                            name="description"
                            className="form-control input-base"
                            cols={30}
                            rows={10}
                        />
                        {errors.description && (
                            <div className="invalid-feedback d-block">
                                {errors.description.message}
                            </div>
                        )}
                    </div>
                </div>
            </BaseForm>
        </form>
    );
}

export default Form;