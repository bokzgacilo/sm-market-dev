"use client";

import { Button, Card, Checkbox, Field, FileUpload, Flex, Heading, IconButton, Image, Input, NativeSelect, NumberInput, Separator, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuRefreshCcw, LuTrash2, LuUpload, LuX } from "react-icons/lu";
import ProductViewer from "@/components/custom/ProductViewer";
import { supabase } from "@/helper/supabase";
import { categories } from "@/constants/Categories";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-")         // replace spaces with dashes
    .replace(/-+/g, "-");         // collapse multiple dashes
}

export default function AddProduct() {
  const [images, setImages] = useState([])
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    brand: "",
    price: 100,
    compare_at_price: 75,
    isSale: false,
    sale_price: 50,
    category: "home-and-essentials",
    subcategory: "appliances",
    child: "cooking-and-stoves",
    "3d_model": "",
    images: [],
    slug: "",
    description: ""
  })

  const subcategories = categories.find(item => item.path === form.category)?.subcategories || [];
  const children = subcategories.find(item => item.path === form.subcategory)?.child || [];

  const handleAddProduct = async () => {
    setLoading(true)
    try {
      const uploadedUrls = [];
      const folder = slugify(form.title)

      // loop upload images
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
      setForm({ ...form, "3d_model": publicData.publicUrl });

      const updatedForm = {
        ...form,
        images: uploadedUrls,
        "3d_model": publicData.publicUrl
      };

      const { data, error: insertError } = await supabase
        .from("products")
        .insert([updatedForm])
        .select(); // optional: returns inserted row

      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }
      alert("Product added successfully!");
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack py={4}>
      <SimpleGrid columns={2} gap={4}>
        <Card.Root>
          <Card.Header p={4}>
            <Card.Title>
              Add New Product
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
                />
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
                    {categories.map((category) =>
                      <option key={category.path} value={category.path}>{category.label}</option>
                    )}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>Sub-Category</Field.Label>
                <NativeSelect.Root
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                >
                  <NativeSelect.Field>
                    {categories.find(item => item.path === form.category)?.subcategories.map((subcat) =>
                      <option key={subcat.path} value={subcat.path}>{subcat.label}</option>
                    )}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>Child</Field.Label>
                <NativeSelect.Root
                  disabled={children.length === 0}
                  value={form.child}
                  onChange={(e) => setForm({ ...form, child: e.target.value })}
                >
                  <NativeSelect.Field>
                    {children.length > 0 ? children.map((child) =>
                      <option key={child.path} value={child.path}>{child.label}</option>
                    ) : <option value="">No Child</option>}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>Description</Field.Label>
                <Textarea height="100%" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field.Root>

              <Button
                mt="auto"
                onClick={handleAddProduct}
                size="xl"
                bg="blue.600"
                loading={loading}
              >Add Product</Button>
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

                    {/* <FileUpload.List /> */}
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
                        const urls = e.acceptedFiles.map((file) => URL.createObjectURL(file));
                        setImages(urls);
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
  )
}