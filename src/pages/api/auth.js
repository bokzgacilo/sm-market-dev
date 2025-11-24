export default async function handler(req, res) {
    console.log(req)
    return res.status(200).json({ message: "Hello" });
}