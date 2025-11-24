"use client";

import { Button, Card, Checkbox, Field, FileUpload, Flex, Heading, IconButton, Image, Input, NativeSelect, NumberInput, Separator, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuSave, LuTrash2, LuUpload, LuX } from "react-icons/lu";
import ProductViewer from "@/components/custom/ProductViewer";
import { supabase } from "@/helper/supabase";
import { useRouter } from "next/router";
import Head from "next/head";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-")         // replace spaces with dashes
    .replace(/-+/g, "-");         // collapse multiple dashes
}

export default function EditProduct() {
  const router = useRouter();
  const { pid } = router.query;
  const [images, setImages] = useState([])
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', pid)
        .single()
      console.log(data)
      setForm(data)
      setImages(data.images)
      setUrl(data["3d_model"])
    }

    fetchProduct()
  }, [pid])

  const handleEditProduct = async () => {
    setLoading(true)
    try {
      const uploadedUrls = [];
      const folder = slugify(form.title)

      for (const [index, imageUrl] of images.entries()) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1];
        const fileName = `${slugify(form.title)}-${index + 1}.${ext}`; // you can detect type if needed
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: true,
            contentType: blob.type,
          });

        if (error) {
          console.error("Upload error:", error);
          return null;
        }

        const { data: publicData } = await supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicData.publicUrl);
        console.log(publicData)
      }

      setForm((prev) => ({
        ...prev,
        images: uploadedUrls
      }));


      const response = await fetch(url);
      const blob = await response.blob();
      const glbBlob = new Blob([blob], { type: "model/gltf-binary" });
      const fileName = `${slugify(form.title)}.glb`; // you can detect type if needed

      const { error } = await supabase.storage
        .from("3d-models")
        .upload(fileName, glbBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "model/gltf-binary",
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const { data: publicData } = await supabase.storage
        .from("3d-models")
        .getPublicUrl(fileName);

      console.log(publicData)


      setForm({ ...form, "3d_model": publicData.publicUrl });

      const updatedForm = {
        ...form,
        images: uploadedUrls,
        "3d_model": publicData.publicUrl
      };

      const { data, error: insertError } = await supabase
        .from("products")
        .update(updatedForm)       // the fields you want to update
        .eq("id", updatedForm.id)  // match record by id
        .select();

      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }

      console.log("✅ Product added successfully:", data);
      alert("Product added successfully!");
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!form) {
    return <Text>Loading...</Text>
  }

  return (
    <>
      <Head>
        <title>Edit Product</title>
      </Head>
      <Stack py={4}>
        <SimpleGrid columns={2} gap={4}>
          <Card.Root>
            <Card.Header p={4}>
              <Card.Title>
                <Heading>Edit Product</Heading>
              </Card.Title>
            </Card.Header>
            <Separator />
            <Card.Body>
              <Stack gap={4} flex={1}>
                <Field.Root>
                  <Field.Label>Product Name</Field.Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                    s />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Brand</Field.Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </Field.Root>
                <SimpleGrid columns={2} gap={4}>
                  <Field.Root>
                    <Field.Label>Price</Field.Label>
                    <NumberInput.Root
                      value={form.price}
                      onValueChange={(e) => setForm({ ...form, price: e.value })}
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
                      onCheckedChange={(e) => setForm({ ...form, isSale: !!e.checked })}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Field.Root>
                  {form.isSale &&
                    <Field.Root>
                      <Field.Label>Sale Price</Field.Label>
                      <NumberInput.Root
                        value={form.compare_at_price}
                        onValueChange={(e) => setForm({ ...form, compare_at_price: e.value })}
                        defaultValue="10"
                        min={5}
                      >
                        <NumberInput.Control />
                        <NumberInput.Input />
                      </NumberInput.Root>
                    </Field.Root>
                  }
                </SimpleGrid>
                <Field.Root>
                  <Field.Label>Category</Field.Label>
                  <NativeSelect.Root
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <NativeSelect.Field>
                      <option value="home-and-essentials">Home and Essentials</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Sub-Category</Field.Label>
                  <NativeSelect.Root
                    disabled
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  >
                    <NativeSelect.Field>
                      <option value="dining">Dining</option>
                      <option value="kitchenware">Kitchenware</option>
                      <option value="disposables">Disposables</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea height="100%" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </Field.Root>

                <Button
                  mt="auto"
                  onClick={handleEditProduct}
                  size="xl"
                  bg="blue.600"
                  loading={loading}
                >Save Product <LuSave /></Button>
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
                <Stack
                  overflowY="auto"
                  maxHeight="400px"
                >
                  <Field.Root>
                    <FileUpload.Root
                      accept={["model/gltf-binary", ".glb"]}
                      maxFiles={1}
                      onFileAccept={async (e) => {
                        const file = e.files[0];
                        if (!file) return;
                        setUrl(URL.createObjectURL(file))
                      }}
                      onChange={(files) => {
                        const file = files[0];
                        if (!file) return;

                        setUrl(URL.createObjectURL(file));
                      }}
                    >
                      <FileUpload.HiddenInput />
                      <Flex
                        direction="row"
                        alignItems="center"
                        mb={2}
                      >
                        <FileUpload.Trigger asChild>
                          <Button variant="outline">
                            <LuUpload /> Upload 3D Model
                          </Button>
                        </FileUpload.Trigger>
                        <IconButton onClick={() => setUrl(null)} display={url ? "flex" : "none"} variant="outline">
                          <LuX />
                        </IconButton>
                      </Flex>
                    </FileUpload.Root>
                  </Field.Root>
                  <ProductViewer modelUrl={url} />
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
                    {images.length === 0 &&
                      <FileUpload.Root
                        accept={["image/*"]}
                        maxFiles={4}
                        onFileChange={(e) => {
                          console.log("Files changed");
                          // Always clear previous images
                          console.log("Changed files:", e.files || e.acceptedFiles);
                          const urls = e.acceptedFiles.map((file) => URL.createObjectURL(file));
                          setImages(urls);
                        }}
                        onFileAccept={(e) => {
                          console.log('clear images')
                        }}
                      >
                        <FileUpload.HiddenInput />
                        <FileUpload.Trigger asChild>
                          <Button variant="outline">
                            <LuUpload /> Upload Product Images
                          </Button>
                        </FileUpload.Trigger>
                      </FileUpload.Root>
                    }
                    {images.length !== 0 ?
                      <Stack
                        gap={4}
                      >
                        <Button variant="outline" onClick={() => setImages([])}>Clear <LuTrash2 /></Button>
                        <SimpleGrid columns={4} gap={4}>
                          {images.map((image, index) => <Image rounded="sm" src={image} key={index} objectFit="cover" height="150px" />)}
                        </SimpleGrid>
                      </Stack>
                      : <Text mt={4}>No image selected</Text>}
                  </Field.Root>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </SimpleGrid>
      </Stack>
    </>
  )
}