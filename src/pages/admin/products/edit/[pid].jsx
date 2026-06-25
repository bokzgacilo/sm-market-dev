'use client';

import {
  Button,
  Card,
  Checkbox,
  Field,
  FileUpload,
  Flex,
  IconButton,
  Image,
  Input,
  NativeSelect,
  NumberInput,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LuSave, LuTrash2, LuUpload, LuX } from 'react-icons/lu';
import ProductViewer from '@/components/custom/ProductViewer';
import { toaster } from '@/components/ui/toaster';
import { categories } from '@/constants/Categories';
import { supabase } from '@/helper/supabase';
import { useAdmin } from '../../layout';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-') // replace spaces with dashes
    .replace(/-+/g, '-'); // collapse multiple dashes
}

export default function EditProduct() {
  const router = useRouter();
  const { userRole } = useAdmin();
  const { pid } = router.query;
  const [images, setImages] = useState([]);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setPageloading] = useState(true);
  const [form, setForm] = useState(null);
  const [measurements, setMeasurements] = useState({
    length: '',
    width: '',
    height: '',
  });
  const subcategories =
    categories.find((item) => item.path === form?.category)?.subcategories ||
    [];
  const children =
    subcategories.find((item) => item.path === form?.subcategory)?.child || [];

  useEffect(() => {
    if (!pid) return;

    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', pid)
        .single();

      if (data) {
        setForm(data);
        setImages(data.images || []);
        setUrl(data['3d_model'] || null);
        setMeasurements({
          length: data.measurements?.length ?? '',
          width: data.measurements?.width ?? '',
          height: data.measurements?.height ?? '',
        });
      }

      setPageloading(false);
    };

    fetchProduct();
  }, [pid]);

  const handleEditProduct = async () => {
    if (userRole !== 'SUPERADMIN') {
      toaster.create({
        title: 'Permission denied',
        description: 'Only SUPERADMIN can edit products.',
        type: 'error',
        closable: true,
      });
      return;
    }

    setLoading(true);
    const toastId = toaster.create({
      title: 'Saving product',
      description: 'Uploading media and updating product details.',
      type: 'loading',
    });

    try {
      const uploadedUrls = [];
      const folder = slugify(form.title);

      for (const [index, imageUrl] of images.entries()) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const ext = blob.type.split('/')[1];
        const fileName = `${slugify(form.title)}-${index + 1}.${ext}`; // you can detect type if needed
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: blob.type,
          });

        if (error) {
          console.error('Upload error:', error);
          toaster.update(toastId, {
            title: 'Save failed',
            description: 'Product image upload failed.',
            type: 'error',
            closable: true,
          });
          return null;
        }

        const { data: publicData } = await supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicData.publicUrl);
      }

      setForm((prev) => ({
        ...prev,
        images: uploadedUrls,
      }));

      const response = await fetch(url);
      const blob = await response.blob();
      const glbBlob = new Blob([blob], { type: 'model/gltf-binary' });
      const fileName = `${slugify(form.title)}.glb`; // you can detect type if needed

      const { error } = await supabase.storage
        .from('3d-models')
        .upload(fileName, glbBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'model/gltf-binary',
        });

      if (error) {
        console.error('Upload error:', error);
        toaster.update(toastId, {
          title: 'Save failed',
          description: '3D model upload failed.',
          type: 'error',
          closable: true,
        });
        return null;
      }

      const { data: publicData } = await supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName);

      const updatedForm = {
        ...form,
        images: uploadedUrls,
        '3d_model': publicData.publicUrl,
        measurements: {
          length: Number(measurements.length),
          width: Number(measurements.width),
          height: Number(measurements.height),
        },
      };

      console.log(updatedForm);

      const { data, error: updateError } = await supabase
        .from('products')
        .update(updatedForm) // the fields you want to update
        .eq('id', updatedForm.id) // match record by id
        .select();

      if (updateError) {
        console.error('Product update error:', updateError);
        toaster.update(toastId, {
          title: 'Save failed',
          description: updateError.message || 'Product update failed.',
          type: 'error',
          closable: true,
        });
        return;
      }

      if (data) {
        toaster.update(toastId, {
          title: 'Product saved',
          description: 'Product details were updated successfully.',
          type: 'success',
          closable: true,
        });
        return;
      } else {
        toaster.update(toastId, {
          title: 'Save failed',
          description: 'No product was updated.',
          type: 'error',
          closable: true,
        });
        return;
      }
    } catch (err) {
      console.error(err);
      toaster.update(toastId, {
        title: 'Save failed',
        description: err?.message || 'Unexpected error while saving product.',
        type: 'error',
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'SUPERADMIN') {
    return (
      <Stack py={4}>
        <Card.Root>
          <Card.Body>
            <Text>Only SUPERADMIN can edit products.</Text>
          </Card.Body>
        </Card.Root>
      </Stack>
    );
  }

  if (!form) return null;

  return (
    <>
      <Head>
        <title>Edit Product | Admin | SM Market</title>
      </Head>
      <Stack py={4}>
        <SimpleGrid columns={2} gap={4}>
          <Card.Root>
            <Card.Header p={4}>
              <Card.Title>Edit Product</Card.Title>
            </Card.Header>
            <Separator />
            <Card.Body>
              <Stack gap={4} flex={1}>
                <Field.Root>
                  <Field.Label>Product Name</Field.Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    s
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Brand</Field.Label>
                  <Input
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  />
                </Field.Root>
                <SimpleGrid columns={2} gap={4}>
                  <Field.Root>
                    <Field.Label>Price</Field.Label>
                    <NumberInput.Root
                      value={form.price}
                      onValueChange={(e) =>
                        setForm({ ...form, price: e.value })
                      }
                      min={10}
                    >
                      <NumberInput.Control />
                      <NumberInput.Input />
                    </NumberInput.Root>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Is On Sale?</Field.Label>
                    <Checkbox.Root
                      value={form.isSale}
                      checked={form.isSale}
                      onCheckedChange={(e) =>
                        setForm({ ...form, isSale: !!e.checked })
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Field.Root>
                  {form.isSale && (
                    <Field.Root>
                      <Field.Label>Sale Price</Field.Label>
                      <NumberInput.Root
                        value={form.compare_at_price}
                        onValueChange={(e) =>
                          setForm({ ...form, compare_at_price: e.value })
                        }
                        defaultValue='10'
                        min={5}
                      >
                        <NumberInput.Control />
                        <NumberInput.Input />
                      </NumberInput.Root>
                    </Field.Root>
                  )}
                </SimpleGrid>
                <Field.Root>
                  <Field.Label>Category</Field.Label>
                  <NativeSelect.Root
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <NativeSelect.Field>
                      {categories.map((category) => (
                        <option key={category.path} value={category.path}>
                          {category.label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Sub-Category</Field.Label>
                  <NativeSelect.Root
                    value={form.subcategory}
                    onChange={(e) =>
                      setForm({ ...form, subcategory: e.target.value })
                    }
                  >
                    <NativeSelect.Field>
                      {categories
                        .find((item) => item.path === form.category)
                        ?.subcategories.map((subcat) => (
                          <option key={subcat.path} value={subcat.path}>
                            {subcat.label}
                          </option>
                        ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Child</Field.Label>
                  <NativeSelect.Root
                    disabled={children.length === 0}
                    value={form.child}
                    onChange={(e) =>
                      setForm({ ...form, child: e.target.value })
                    }
                  >
                    <NativeSelect.Field>
                      {children.length > 0 ? (
                        children.map((child) => (
                          <option key={child.path} value={child.path}>
                            {child.label}
                          </option>
                        ))
                      ) : (
                        <option value=''>No Child</option>
                      )}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    height='100%'
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </Field.Root>

                <Card.Root variant='outline'>
                  <Card.Header p={4}>
                    <Card.Title>Measurements</Card.Title>
                  </Card.Header>
                  <Separator />
                  <Card.Body p={4}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                      <Field.Root>
                        <Field.Label>Length</Field.Label>
                        <NumberInput.Root
                          value={measurements.length}
                          onValueChange={(e) =>
                            setMeasurements((current) => ({
                              ...current,
                              length: e.value,
                            }))
                          }
                          min={0}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Width</Field.Label>
                        <NumberInput.Root
                          value={measurements.width}
                          onValueChange={(e) =>
                            setMeasurements((current) => ({
                              ...current,
                              width: e.value,
                            }))
                          }
                          min={0}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>Height</Field.Label>
                        <NumberInput.Root
                          value={measurements.height}
                          onValueChange={(e) =>
                            setMeasurements((current) => ({
                              ...current,
                              height: e.value,
                            }))
                          }
                          min={0}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input />
                        </NumberInput.Root>
                      </Field.Root>
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                <Button
                  mt='auto'
                  onClick={handleEditProduct}
                  size='xl'
                  bg='blue.600'
                  loading={loading}
                >
                  Save Product <LuSave />
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>
          <Stack>
            <Card.Root>
              <Card.Header p={4}>
                <Card.Title>3D Model Upload</Card.Title>
              </Card.Header>
              <Separator />
              <Card.Body p={4}>
                <Stack overflowY='auto' maxHeight='400px'>
                  <Field.Root>
                    <FileUpload.Root
                      accept={['model/gltf-binary', '.glb']}
                      maxFiles={1}
                      onFileAccept={async (e) => {
                        const file = e.files[0];
                        if (!file) return;
                        setUrl(URL.createObjectURL(file));
                      }}
                      onChange={(files) => {
                        const file = files[0];
                        if (!file) return;

                        setUrl(URL.createObjectURL(file));
                      }}
                    >
                      <FileUpload.HiddenInput />
                      <Flex direction='row' alignItems='center' mb={2}>
                        <FileUpload.Trigger asChild>
                          <Button variant='outline'>
                            <LuUpload /> Upload 3D Model
                          </Button>
                        </FileUpload.Trigger>
                        <IconButton
                          onClick={() => setUrl(null)}
                          display={url ? 'flex' : 'none'}
                          variant='outline'
                        >
                          <LuX />
                        </IconButton>
                      </Flex>
                    </FileUpload.Root>
                  </Field.Root>
                  <ProductViewer
                    modelUrl={url}
                    description={form.description}
                    productMeasurements={measurements}
                  />
                </Stack>
              </Card.Body>
            </Card.Root>
            <Card.Root>
              <Card.Header p={4}>
                <Card.Title>Product Images</Card.Title>
              </Card.Header>
              <Separator />
              <Card.Body p={4}>
                <Stack>
                  <Field.Root>
                    {images.length === 0 && (
                      <FileUpload.Root
                        accept={['image/*']}
                        maxFiles={4}
                        onFileChange={(e) => {
                          const urls = e.acceptedFiles.map((file) =>
                            URL.createObjectURL(file),
                          );
                          setImages(urls);
                        }}
                        onFileAccept={() => {}}
                      >
                        <FileUpload.HiddenInput />
                        <FileUpload.Trigger asChild>
                          <Button variant='outline'>
                            <LuUpload /> Upload Product Images
                          </Button>
                        </FileUpload.Trigger>
                      </FileUpload.Root>
                    )}
                    {images.length !== 0 ? (
                      <Stack gap={4}>
                        <Button variant='outline' onClick={() => setImages([])}>
                          Clear <LuTrash2 />
                        </Button>
                        <SimpleGrid columns={4} gap={4}>
                          {images.map((image) => (
                            <Image
                              rounded='sm'
                              src={image}
                              key={image}
                              objectFit='cover'
                              height='150px'
                            />
                          ))}
                        </SimpleGrid>
                      </Stack>
                    ) : (
                      <Text mt={4}>No image selected</Text>
                    )}
                  </Field.Root>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </SimpleGrid>
      </Stack>
    </>
  );
}
